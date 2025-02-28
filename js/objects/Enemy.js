/**
 * Enemy
 * Handles enemy vehicles and drones
 */
class Enemy {
    constructor(scene, x, y, type = 'enemy-car') {
        this.scene = scene;
        this.type = type;
        
        // Create enemy sprite
        this.sprite = scene.physics.add.sprite(x, y, type);
        this.sprite.setDepth(5);
        
        // Store reference to this enemy in the sprite
        this.sprite.enemyRef = this;
        
        // Enemy properties
        this.speed = type === 'drone' ? 100 : 150;
        this.health = type === 'drone' ? 1 : 3;
        this.damage = type === 'drone' ? 10 : 20;
        this.scoreValue = type === 'drone' ? 50 : 100;
        this.active = true;
        
        // Set up behavior based on type
        if (type === 'drone') {
            this.setupDrone();
        } else {
            this.setupCar();
        }
    }
    
    setupDrone() {
        // Drones hover and move randomly until player approaches
        this.sprite.setScale(0.8);
        this.detectionRadius = 300; // How close player needs to be for drone to attack
        this.isAttacking = false;
        
        // Add hover animation
        this.scene.tweens.add({
            targets: this.sprite,
            y: this.sprite.y + 20,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Set idle movement pattern (slower and less frequent changes)
        this.movementTimer = this.scene.time.addEvent({
            delay: 3000, // Longer delay between direction changes
            callback: this.changeDirection,
            callbackScope: this,
            loop: true
        });
        
        // Initial direction with slower speed
        this.idleSpeed = 50; // Slower speed when not attacking
        this.attackSpeed = 150; // Faster speed when attacking
        this.speed = this.idleSpeed;
        this.changeDirection();
    }
    
    setupCar() {
        // Enemy cars chase the player
        this.sprite.setScale(1);
        
        // Set initial angle towards player
        this.updateAngle();
    }
    
    changeDirection() {
        if (!this.active) return;
        
        // Choose random direction
        const angle = Phaser.Math.Between(0, 360);
        this.sprite.rotation = Phaser.Math.DegToRad(angle);
        
        // Set velocity based on angle
        const vx = Math.cos(this.sprite.rotation) * this.speed;
        const vy = Math.sin(this.sprite.rotation) * this.speed;
        
        this.sprite.setVelocity(vx, vy);
    }
    
    updateAngle() {
        if (!this.active || !this.scene.player || !this.scene.player.sprite.active) return;
        
        // Calculate angle to player
        const dx = this.scene.player.sprite.x - this.sprite.x;
        const dy = this.scene.player.sprite.y - this.sprite.y;
        const angle = Math.atan2(dy, dx);
        
        // Set rotation
        this.sprite.rotation = angle;
        
        // Set velocity based on angle
        const vx = Math.cos(angle) * this.speed;
        const vy = Math.sin(angle) * this.speed;
        
        this.sprite.setVelocity(vx, vy);
    }
    
    update() {
        if (!this.active) return;
        
        if (this.scene.player && this.scene.player.sprite.active) {
            const distance = Phaser.Math.Distance.Between(
                this.sprite.x, this.sprite.y,
                this.scene.player.sprite.x, this.scene.player.sprite.y
            );
            
            // Despawn if too far (outside camera view)
            if (distance > 1500) {
                this.destroy();
                return;
            }
            
            if (this.type === 'enemy-car') {
                // Update car angle to chase player
                this.updateAngle();
            } else if (this.type === 'drone') {
                // Drone behavior: attack only when player is within detection radius
                if (distance <= this.detectionRadius && !this.isAttacking) {
                    // Switch to attack mode
                    this.isAttacking = true;
                    this.speed = this.attackSpeed;
                    
                    // Clear the random movement timer
                    if (this.movementTimer) {
                        this.movementTimer.remove();
                        this.movementTimer = null;
                    }
                    
                    // Add visual indicator that drone is in attack mode
                    this.sprite.setTint(0xff0000);
                } else if (distance > this.detectionRadius && this.isAttacking) {
                    // Switch back to idle mode
                    this.isAttacking = false;
                    this.speed = this.idleSpeed;
                    
                    // Restore random movement if timer was removed
                    if (!this.movementTimer) {
                        this.movementTimer = this.scene.time.addEvent({
                            delay: 3000,
                            callback: this.changeDirection,
                            callbackScope: this,
                            loop: true
                        });
                        this.changeDirection();
                    }
                    
                    // Remove attack tint
                    this.sprite.clearTint();
                }
                
                // Update drone movement based on current mode
                if (this.isAttacking) {
                    this.updateAngle(); // Chase player when attacking
                }
            }
        }
    }
    
    takeDamage(amount) {
        if (!this.active) return;
        
        // Reduce health
        this.health -= amount;
        
        // Flash effect
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: { from: 0.5, to: 1 },
            duration: 100,
            repeat: 1
        });
        
        // Check if enemy is destroyed
        if (this.health <= 0) {
            this.destroy();
            
            // Add score
            if (this.scene.addScore) {
                this.scene.addScore(this.scoreValue);
            }
            
            // Create explosion effect
            this.createExplosion();
            
            // Chance to drop pickup
            this.dropPickup();
        }
    }
    
    createExplosion() {
        // Create explosion particle effect
        const explosion = this.scene.add.particles(this.sprite.x, this.sprite.y, 'bullet', {
            speed: { min: 30, max: 100 },
            scale: { start: 1, end: 0 },
            lifespan: 800,
            blendMode: 'ADD',
            quantity: 15
        });
        
        // Auto-destroy particles after animation completes
        this.scene.time.delayedCall(800, () => {
            explosion.destroy();
        });
    }
    
    dropPickup() {
        // 30% chance to drop a pickup
        if (Math.random() < 0.3) {
            // Determine pickup type
            const pickupType = Math.random() < 0.5 ? 'ammo' : 'health';
            
            // Create pickup sprite
            const pickup = this.scene.physics.add.sprite(
                this.sprite.x,
                this.sprite.y,
                'bullet' // Reuse bullet sprite with different color
            );
            
            // Set pickup properties
            pickup.setTint(pickupType === 'ammo' ? 0xf39c12 : 0x2ecc71);
            pickup.setScale(1.5);
            pickup.pickupType = pickupType;
            pickup.pickupValue = pickupType === 'ammo' ? 20 : 25;
            
            // Add to pickups group
            if (this.scene.pickups) {
                this.scene.pickups.add(pickup);
            }
            
            // Add glow effect
            this.scene.tweens.add({
                targets: pickup,
                alpha: { from: 0.6, to: 1 },
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        }
    }
    
    destroy() {
        if (!this.active) return;
        
        // Set inactive
        this.active = false;
        
        // Clear timers
        if (this.movementTimer) {
            this.movementTimer.remove();
        }
        
        // Destroy sprite
        this.sprite.destroy();
    }
    
    static spawnEnemy(scene, type = 'enemy-car') {
        if (!scene.player || !scene.player.sprite.active) return null;
        
        // Calculate spawn position (off-screen, around player)
        const spawnDistance = 800;
        const angle = Phaser.Math.Between(0, 360);
        const spawnX = scene.player.sprite.x + Math.cos(Phaser.Math.DegToRad(angle)) * spawnDistance;
        const spawnY = scene.player.sprite.y + Math.sin(Phaser.Math.DegToRad(angle)) * spawnDistance;
        
        // Create new enemy
        return new Enemy(scene, spawnX, spawnY, type);
    }
    
    static spawnEnemies(scene, count, type = 'enemy-car') {
        const enemies = [];
        
        for (let i = 0; i < count; i++) {
            const enemy = Enemy.spawnEnemy(scene, type);
            if (enemy) {
                enemies.push(enemy);
            }
        }
        
        return enemies;
    }
}