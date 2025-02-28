/**
 * Player
 * Handles player vehicle, movement, and shooting
 */
class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        
        // Create player sprite
        this.sprite = scene.physics.add.sprite(x, y, 'player-car');
        this.sprite.setCollideWorldBounds(false);
        this.sprite.setDepth(10);
        
        // Player properties
        this.speed = 200 * scene.game.gameState.playerStats.speed;
        this.rotationSpeed = 3;
        this.health = scene.game.gameState.playerStats.health;
        this.maxHealth = 100;
        this.ammo = scene.game.gameState.playerStats.ammo;
        this.fireRate = 300 / scene.game.gameState.playerStats.fireRate; // ms between shots
        this.lastFired = 0;
        this.invulnerable = false;
        this.invulnerableTime = 1000; // ms
        
        // Create bullets group
        this.bullets = scene.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 20
        });
        
        // Create engine sound
        this.engineSound = scene.sound.add('engine', {
            loop: true,
            volume: 0.5
        });
        
        // Create shoot sound
        this.shootSound = scene.sound.add('shoot', {
            loop: false,
            volume: 0.3
        });
        
        // Create crash sound
        this.crashSound = scene.sound.add('crash', {
            loop: false,
            volume: 0.5
        });
        
        // Start engine sound
        this.engineSound.play();
        
        // Setup input
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Create health bar
        this.createHealthBar();
        
        // Create ammo display
        this.createAmmoDisplay();
    }
    
    update(time, delta) {
        // Handle movement
        this.handleMovement();
        
        // Handle shooting
        this.handleShooting(time);
        
        // Update bullets
        this.updateBullets();
        
        // Update UI
        this.updateUI();
    }
    
    handleMovement() {
        // Reset velocity
        this.sprite.setVelocity(0);
        
        // Handle rotation
        if (this.cursors.left.isDown) {
            this.sprite.angle -= this.rotationSpeed;
        } else if (this.cursors.right.isDown) {
            this.sprite.angle += this.rotationSpeed;
        }
        
        // Handle acceleration
        if (this.cursors.up.isDown) {
            // Calculate velocity based on angle
            const angle = Phaser.Math.DegToRad(this.sprite.angle - 90);
            const vx = Math.cos(angle) * this.speed;
            const vy = Math.sin(angle) * this.speed;
            
            this.sprite.setVelocity(vx, vy);
            
            // Adjust engine sound pitch based on speed
            this.engineSound.setRate(1.2);
        } else if (this.cursors.down.isDown) {
            // Reverse
            const angle = Phaser.Math.DegToRad(this.sprite.angle - 90);
            const vx = Math.cos(angle) * -this.speed * 0.5;
            const vy = Math.sin(angle) * -this.speed * 0.5;
            
            this.sprite.setVelocity(vx, vy);
            
            // Adjust engine sound pitch based on speed
            this.engineSound.setRate(0.8);
        } else {
            // Idle
            this.engineSound.setRate(1.0);
        }
    }
    
    handleShooting(time) {
        if (this.spaceKey.isDown && time > this.lastFired && this.ammo > 0) {
            // Create bullet
            const bullet = this.bullets.get();
            
            if (bullet) {
                // Set bullet position and angle
                const angle = Phaser.Math.DegToRad(this.sprite.angle - 90);
                const offsetX = Math.cos(angle) * 30;
                const offsetY = Math.sin(angle) * 30;
                
                bullet.setActive(true);
                bullet.setVisible(true);
                bullet.setPosition(this.sprite.x + offsetX, this.sprite.y + offsetY);
                bullet.setRotation(angle);
                
                // Set bullet velocity
                const bulletSpeed = 500;
                const vx = Math.cos(angle) * bulletSpeed;
                const vy = Math.sin(angle) * bulletSpeed;
                
                bullet.setVelocity(vx, vy);
                
                // Set bullet lifespan
                bullet.lifespan = 1000;
                
                // Play shoot sound
                this.shootSound.play();
                
                // Update last fired time
                this.lastFired = time + this.fireRate;
                
                // Decrease ammo
                this.ammo--;
            }
        }
    }
    
    updateBullets() {
        // Update bullet lifespan and remove expired bullets
        this.bullets.getChildren().forEach(bullet => {
            if (bullet.active) {
                bullet.lifespan -= 16; // Approximate ms per frame
                
                if (bullet.lifespan <= 0) {
                    bullet.setActive(false);
                    bullet.setVisible(false);
                }
            }
        });
    }
    
    takeDamage(amount) {
        // Skip if invulnerable
        if (this.invulnerable) return;
        
        // Reduce health
        this.health -= amount;
        
        // Play crash sound
        this.crashSound.play();
        
        // Make player invulnerable briefly
        this.invulnerable = true;
        this.sprite.alpha = 0.5;
        
        // Flash effect
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: { from: 0.5, to: 1 },
            duration: 100,
            repeat: 5
        });
        
        // Reset invulnerability after delay
        this.scene.time.delayedCall(this.invulnerableTime, () => {
            this.invulnerable = false;
            this.sprite.alpha = 1;
        });
        
        // Check if player is dead
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
    }
    
    die() {
        // Stop engine sound
        this.engineSound.stop();
        
        // Create explosion effect
        const explosion = this.scene.add.particles(this.sprite.x, this.sprite.y, 'bullet', {
            speed: { min: 50, max: 150 },
            scale: { start: 1, end: 0 },
            lifespan: 1000,
            blendMode: 'ADD',
            quantity: 30
        });
        
        // Hide player sprite
        this.sprite.setVisible(false);
        this.sprite.setActive(false);
        
        // Notify game scene
        this.scene.playerDied();
    }
    
    addAmmo(amount) {
        this.ammo += amount;
    }
    
    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }
    
    createHealthBar() {
        // Create health bar background
        this.healthBarBg = this.scene.add.rectangle(
            100, 30, 200, 20, 0x000000, 0.7
        ).setScrollFactor(0).setDepth(100);
        
        // Create health bar
        this.healthBar = this.scene.add.rectangle(
            100, 30, 200, 20, 0xe74c3c, 1
        ).setScrollFactor(0).setOrigin(0, 0.5).setDepth(100);
        
        // Create health text
        this.healthText = this.scene.add.text(
            100, 30, 'Health', {
                font: '14px Arial',
                fill: '#ffffff'
            }
        ).setScrollFactor(0).setOrigin(0.5).setDepth(100);
    }
    
    createAmmoDisplay() {
        // Create ammo background
        this.ammoBg = this.scene.add.rectangle(
            100, 60, 200, 20, 0x000000, 0.7
        ).setScrollFactor(0).setDepth(100);
        
        // Create ammo text
        this.ammoText = this.scene.add.text(
            100, 60, `Ammo: ${this.ammo}`, {
                font: '14px Arial',
                fill: '#ffffff'
            }
        ).setScrollFactor(0).setOrigin(0.5).setDepth(100);
    }
    
    updateUI() {
        // Update health bar
        const healthPercent = this.health / this.maxHealth;
        this.healthBar.width = 200 * healthPercent;
        
        // Update health color based on value
        if (healthPercent < 0.3) {
            this.healthBar.fillColor = 0xe74c3c; // Red
        } else if (healthPercent < 0.6) {
            this.healthBar.fillColor = 0xf39c12; // Orange
        } else {
            this.healthBar.fillColor = 0x2ecc71; // Green
        }
        
        // Update ammo text
        this.ammoText.setText(`Ammo: ${this.ammo}`);
    }
    
    destroy() {
        // Stop sounds
        this.engineSound.stop();
        
        // Destroy sprites
        this.sprite.destroy();
        this.bullets.clear(true, true);
        
        // Destroy UI elements
        this.healthBarBg.destroy();
        this.healthBar.destroy();
        this.healthText.destroy();
        this.ammoBg.destroy();
        this.ammoText.destroy();
    }
}