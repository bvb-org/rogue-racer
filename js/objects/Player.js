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
        this.baseSpeed = 200 * scene.game.gameState.playerStats.speed;
        this.speed = this.baseSpeed;
        this.rotationSpeed = 3;
        this.health = scene.game.gameState.playerStats.health;
        this.maxHealth = 100;
        this.ammo = scene.game.gameState.playerStats.ammo;
        this.fireRate = 300 / scene.game.gameState.playerStats.fireRate; // ms between shots
        this.lastFired = 0;
        this.invulnerable = false;
        this.invulnerableTime = 1000; // ms
        this.isOnGrass = false; // Flag to track if player is on grass
        
        // Weapon system
        this.weapons = {
            bullet: {
                name: 'Pistol',
                damage: 1,
                fireRate: 300 / scene.game.gameState.playerStats.fireRate,
                projectileSpeed: 500,
                projectileLifespan: 1000,
                projectileKey: 'bullet',
                sound: 'shoot',
                unlocked: true
            },
            rocket: {
                name: 'Rachetă',
                damage: 3,
                fireRate: 1000,
                projectileSpeed: 300,
                projectileLifespan: 1500,
                projectileKey: 'rocket',
                sound: 'rocket-launch',
                explosionRadius: 100,
                unlocked: scene.game.gameState.rocketUnlocked || scene.game.gameState.currentCity !== 'Bucharest' // Unlocked after first city or if already unlocked
            },
            laser: {
                name: 'Laser',
                damage: 2,
                fireRate: 200,
                projectileSpeed: 800,
                projectileLifespan: 800,
                projectileKey: 'laser',
                sound: 'laser',
                unlocked: scene.game.gameState.laserUnlocked ||
                          scene.game.gameState.currentCity === 'Cluj-Napoca' ||
                          scene.game.gameState.currentCity === 'Timisoara' ||
                          scene.game.gameState.currentCity === 'Iasi' ||
                          scene.game.gameState.currentCity === 'Vaslui' // Unlocked in later cities or if already unlocked
            }
        };
        
        // Current weapon
        this.currentWeapon = 'bullet';
        
        // Shockwave ability properties
        this.shockwaveUnlocked = false; // Will be set to true after first city is completed
        this.shockwaveCooldown = 10000; // 10 seconds cooldown
        this.lastShockwaveUsed = 0;
        this.shockwaveRadius = 300; // Radius of the shockwave effect
        
        // Acceleration properties for gradual speed changes
        this.accelerationFactor = 0.03; // Adjust this to control acceleration speed (lower = slower)
        this.currentVelocityX = 0;
        this.currentVelocityY = 0;
        
        // Create bullets group
        this.bullets = scene.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 20
        });
        
        // Create engine sound system
        this.engineSound = scene.sound.add('engine', {
            loop: true,
            volume: 0.03
        });
        
        // Engine sound variables
        this.currentSpeed = 0;
        this.targetSpeed = 0;
        this.acceleration = 0;
        this.currentGear = 0;
        this.maxGears = 5;
        this.gearShiftTime = 0;
        this.isRevving = false;
        this.revSoundTimer = null;
        
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
        this.shockwaveKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        
        // Weapon switching keys
        this.key1 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.key2 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.key3 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
        
        // Create health bar
        this.createHealthBar();
        
        // Create ammo display
        this.createAmmoDisplay();
        
        // Create shockwave cooldown display (initially hidden)
        this.createShockwaveDisplay();
    }
    
    update(time, delta) {
        // Handle movement
        this.handleMovement();
        
        // Handle weapon switching
        this.handleWeaponSwitching();
        
        // Handle shooting
        this.handleShooting(time);
        
        // Handle shockwave
        this.handleShockwave(time);
        
        // Update bullets
        this.updateBullets();
        
        // Update engine sound
        this.updateEngineSound(time, delta);
        
        // Update UI
        this.updateUI();
    }
    
    handleWeaponSwitching() {
        // Switch to pistol (default weapon)
        if (this.key1.isDown && this.currentWeapon !== 'bullet') {
            this.currentWeapon = 'bullet';
            this.scene.showMessage(`Armă: ${this.weapons.bullet.name}`);
        }
        
        // Switch to rocket launcher if unlocked
        if (this.key2.isDown && this.weapons.rocket.unlocked && this.currentWeapon !== 'rocket') {
            this.currentWeapon = 'rocket';
            this.scene.showMessage(`Armă: ${this.weapons.rocket.name}`);
        }
        
        // Switch to laser if unlocked
        if (this.key3.isDown && this.weapons.laser.unlocked && this.currentWeapon !== 'laser') {
            this.currentWeapon = 'laser';
            this.scene.showMessage(`Armă: ${this.weapons.laser.name}`);
        }
    }
    
    handleShockwave(time) {
        // Skip if shockwave is not unlocked
        if (!this.shockwaveUnlocked) return;
        
        // Check if shockwave key is pressed and cooldown has passed
        if (this.shockwaveKey.isDown && time > this.lastShockwaveUsed + this.shockwaveCooldown) {
            // Trigger shockwave
            this.activateShockwave();
            
            // Update last used time
            this.lastShockwaveUsed = time;
        }
    }
    
    activateShockwave() {
        // Create shockwave visual effect
        const shockwave = this.scene.add.circle(
            this.sprite.x,
            this.sprite.y,
            10,
            0x00ffff,
            0.8
        );
        shockwave.setDepth(20);
        
        // Animate the shockwave expanding outward
        this.scene.tweens.add({
            targets: shockwave,
            radius: this.shockwaveRadius,
            alpha: 0,
            duration: 500,
            ease: 'Cubic.Out',
            onComplete: () => {
                shockwave.destroy();
            }
        });
        
        // Find all enemies within the shockwave radius
        const enemiesHit = this.scene.enemiesArray.filter(enemy => {
            if (!enemy.active) return false;
            
            const distance = Phaser.Math.Distance.Between(
                this.sprite.x, this.sprite.y,
                enemy.sprite.x, enemy.sprite.y
            );
            
            return distance <= this.shockwaveRadius;
        });
        
        // Destroy all enemies within radius
        enemiesHit.forEach(enemy => {
            // Create a special destruction effect
            this.createShockwaveDestructionEffect(enemy.sprite.x, enemy.sprite.y);
            
            // Destroy the enemy
            enemy.takeDamage(enemy.health);
            
            // Add bonus score
            this.scene.addScore(enemy.scoreValue);
        });
        
        // Play shockwave sound
        if (this.scene.sound.get('shoot')) {
            const shockwaveSound = this.scene.sound.get('shoot');
            shockwaveSound.setDetune(600);
            shockwaveSound.setVolume(0.5);
            shockwaveSound.play();
        }
    }
    
    createShockwaveDestructionEffect(x, y) {
        // Create a more dramatic explosion effect for shockwave kills
        const explosion = this.scene.add.particles(x, y, 'bullet', {
            speed: { min: 50, max: 200 },
            scale: { start: 1.5, end: 0 },
            lifespan: 1000,
            blendMode: 'ADD',
            tint: 0x00ffff,
            quantity: 25
        });
        
        // Auto-destroy particles after animation completes
        this.scene.time.delayedCall(1000, () => {
            explosion.destroy();
        });
    }
    
    updateEngineSound(time, delta) {
        // Calculate actual speed from velocity
        const velocity = Math.sqrt(Math.pow(this.sprite.body.velocity.x, 2) + Math.pow(this.sprite.body.velocity.y, 2));
        this.currentSpeed = Phaser.Math.Linear(this.currentSpeed, velocity, 0.1);
        
        // Calculate acceleration
        const prevAcceleration = this.acceleration;
        this.acceleration = this.targetSpeed - this.currentSpeed;
        
        // Determine appropriate gear based on speed
        const maxSpeed = this.baseSpeed;
        const prevGear = this.currentGear;
        
        if (this.currentSpeed < maxSpeed * 0.1) {
            this.currentGear = 0; // Idle
        } else if (this.currentSpeed < maxSpeed * 0.3) {
            this.currentGear = 1; // First gear
        } else if (this.currentSpeed < maxSpeed * 0.5) {
            this.currentGear = 2; // Second gear
        } else if (this.currentSpeed < maxSpeed * 0.7) {
            this.currentGear = 3; // Third gear
        } else if (this.currentSpeed < maxSpeed * 0.9) {
            this.currentGear = 4; // Fourth gear
        } else {
            this.currentGear = 5; // Fifth gear
        }
        
        // Handle gear shifts
        if (prevGear !== this.currentGear && time > this.gearShiftTime) {
            // Gear shift sound effect
            if (this.currentGear > prevGear) {
                // Shifting up
                this.engineSound.setRate(0.8);
                this.scene.time.delayedCall(100, () => {
                    this.engineSound.setRate(1.2);
                });
                this.scene.time.delayedCall(200, () => {
                    // Reset to appropriate rate for new gear
                    const newRate = 0.8 + (this.currentGear / this.maxGears) * 0.6;
                    this.engineSound.setRate(newRate);
                });
            } else {
                // Shifting down
                this.engineSound.setRate(1.3);
                this.scene.time.delayedCall(100, () => {
                    this.engineSound.setRate(0.9);
                });
                this.scene.time.delayedCall(200, () => {
                    // Reset to appropriate rate for new gear
                    const newRate = 0.8 + (this.currentGear / this.maxGears) * 0.6;
                    this.engineSound.setRate(newRate);
                });
            }
            
            // Set cooldown for gear shifts
            this.gearShiftTime = time + 500;
        }
        
        // Handle revving when accelerating hard
        if (this.acceleration > 20 && !this.isRevving && time > this.gearShiftTime) {
            this.isRevving = true;
            
            // Rev sound effect
            const currentRate = this.engineSound.rate;
            this.engineSound.setRate(currentRate + 0.3);
            
            // Reset after rev
            this.revSoundTimer = this.scene.time.delayedCall(300, () => {
                this.isRevving = false;
                this.engineSound.setRate(0.8 + (this.currentGear / this.maxGears) * 0.6);
            });
        }
        
        // Adjust base engine sound based on terrain and speed
        if (!this.isRevving && time > this.gearShiftTime) {
            let baseRate;
            
            if (this.currentSpeed < 10) {
                // Idle
                baseRate = this.isOnGrass ? 0.7 : 0.8;
            } else {
                // Moving
                const gearFactor = this.currentGear / this.maxGears;
                baseRate = this.isOnGrass ?
                    0.7 + gearFactor * 0.4 : // On grass
                    0.8 + gearFactor * 0.6;  // On road
            }
            
            // Smooth transition to new rate
            const currentRate = this.engineSound.rate;
            const newRate = Phaser.Math.Linear(currentRate, baseRate, 0.1);
            this.engineSound.setRate(newRate);
        }
    }
    
    handleMovement() {
        // Update speed based on terrain
        if (this.isOnGrass) {
            // 70% slower on grass
            this.speed = this.baseSpeed * 0.7;
        } else {
            // Normal speed on road
            this.speed = this.baseSpeed;
        }
        
        // Handle rotation
        if (this.cursors.left.isDown) {
            this.sprite.angle -= this.rotationSpeed;
        } else if (this.cursors.right.isDown) {
            this.sprite.angle += this.rotationSpeed;
        }
        
        // Calculate angle for movement
        const angle = Phaser.Math.DegToRad(this.sprite.angle - 90);
        
        // Handle acceleration
        if (this.cursors.up.isDown) {
            // Calculate target velocity based on angle
            const targetVX = Math.cos(angle) * this.speed;
            const targetVY = Math.sin(angle) * this.speed;
            
            // Gradually approach target velocity
            this.currentVelocityX = Phaser.Math.Linear(this.currentVelocityX, targetVX, this.accelerationFactor);
            this.currentVelocityY = Phaser.Math.Linear(this.currentVelocityY, targetVY, this.accelerationFactor);
            
            // Set target speed for engine sound calculation
            this.targetSpeed = this.speed;
        } else if (this.cursors.down.isDown) {
            // Reverse - calculate target velocity
            const targetVX = Math.cos(angle) * -this.speed * 0.5;
            const targetVY = Math.sin(angle) * -this.speed * 0.5;
            
            // Gradually approach target velocity
            this.currentVelocityX = Phaser.Math.Linear(this.currentVelocityX, targetVX, this.accelerationFactor);
            this.currentVelocityY = Phaser.Math.Linear(this.currentVelocityY, targetVY, this.accelerationFactor);
            
            // Set target speed for engine sound calculation (negative for reverse)
            this.targetSpeed = -this.speed * 0.5;
        } else {
            // Idle - gradually slow down
            this.currentVelocityX = Phaser.Math.Linear(this.currentVelocityX, 0, this.accelerationFactor * 1.5);
            this.currentVelocityY = Phaser.Math.Linear(this.currentVelocityY, 0, this.accelerationFactor * 1.5);
            this.targetSpeed = 0;
        }
        
        // Apply the calculated velocity
        this.sprite.setVelocity(this.currentVelocityX, this.currentVelocityY);
    }
    
    handleShooting(time) {
        // Get current weapon config
        const weapon = this.weapons[this.currentWeapon];
        
        // Check if player can shoot
        if (this.spaceKey.isDown && time > this.lastFired && this.ammo > 0) {
            // Create projectile
            const projectile = this.bullets.get();
            
            if (projectile) {
                // Set projectile texture based on weapon type
                projectile.setTexture(weapon.projectileKey);
                
                // Set projectile position and angle
                const angle = Phaser.Math.DegToRad(this.sprite.angle - 90);
                const offsetX = Math.cos(angle) * 30;
                const offsetY = Math.sin(angle) * 30;
                
                projectile.setActive(true);
                projectile.setVisible(true);
                projectile.setPosition(this.sprite.x + offsetX, this.sprite.y + offsetY);
                projectile.setRotation(angle);
                
                // Set projectile velocity
                const vx = Math.cos(angle) * weapon.projectileSpeed;
                const vy = Math.sin(angle) * weapon.projectileSpeed;
                
                projectile.setVelocity(vx, vy);
                
                // Set projectile properties
                projectile.lifespan = weapon.projectileLifespan;
                projectile.damage = weapon.damage;
                projectile.weaponType = this.currentWeapon;
                
                // Special properties for rockets
                if (this.currentWeapon === 'rocket') {
                    projectile.explosionRadius = weapon.explosionRadius;
                    
                    // Make rockets larger
                    projectile.setScale(1.5);
                    
                    // Add trail effect for rockets
                    this.createRocketTrail(projectile);
                }
                
                // Special properties for lasers
                if (this.currentWeapon === 'laser') {
                    // Make lasers longer and thinner
                    projectile.setScale(1, 2);
                    
                    // Add glow effect for lasers
                    projectile.setTint(0x3498db);
                }
                
                // Play appropriate sound
                if (weapon.sound === 'shoot') {
                    this.shootSound.play();
                } else {
                    // Use the existing sound but modify it
                    const weaponSound = this.scene.sound.get(weapon.sound);
                    if (weaponSound) {
                        weaponSound.play();
                    } else {
                        this.shootSound.play();
                    }
                }
                
                // Update last fired time
                this.lastFired = time + weapon.fireRate;
                
                // Decrease ammo
                this.ammo--;
            }
        }
    }
    
    createRocketTrail(rocket) {
        // Create a particle emitter for the rocket trail
        const particles = this.scene.add.particles(rocket.x, rocket.y, 'bullet', {
            speed: { min: 10, max: 50 },
            scale: { start: 0.5, end: 0 },
            lifespan: 300,
            blendMode: 'ADD',
            tint: 0xf39c12,
            follow: rocket,
            followOffset: { x: -10, y: 0 },
            rotate: { min: 0, max: 360 },
            quantity: 1
        });
        
        // Store reference to particles in rocket for cleanup
        rocket.particles = particles;
        
        // Set up cleanup when rocket is deactivated
        const originalDeactivate = rocket.setActive;
        rocket.setActive = function(value) {
            originalDeactivate.call(this, value);
            if (!value && this.particles) {
                this.particles.destroy();
                this.particles = null;
            }
        };
    }
    
    updateBullets() {
        // Update bullet lifespan and remove expired bullets
        this.bullets.getChildren().forEach(bullet => {
            if (bullet.active) {
                bullet.lifespan -= 16; // Approximate ms per frame
                
                // Special behavior for rockets
                if (bullet.weaponType === 'rocket') {
                    // Add slight wobble to rocket trajectory
                    const wobble = Math.sin(this.scene.time.now / 100) * 0.5;
                    bullet.body.velocity.x += wobble;
                    bullet.body.velocity.y += wobble;
                }
                
                // Special behavior for lasers
                if (bullet.weaponType === 'laser') {
                    // Add pulsing effect to lasers
                    const pulse = (Math.sin(this.scene.time.now / 50) + 1) / 2;
                    bullet.setAlpha(0.7 + pulse * 0.3);
                }
                
                // Handle bullet expiration
                if (bullet.lifespan <= 0) {
                    // Special explosion for rockets
                    if (bullet.weaponType === 'rocket') {
                        this.createRocketExplosion(bullet.x, bullet.y, bullet.explosionRadius);
                    }
                    
                    bullet.setActive(false);
                    bullet.setVisible(false);
                }
            }
        });
    }
    
    createRocketExplosion(x, y, radius) {
        // Create visual explosion effect
        const explosion = this.scene.add.particles(x, y, 'explosion', {
            speed: { min: 50, max: 200 },
            scale: { start: 1, end: 0 },
            lifespan: 800,
            blendMode: 'ADD',
            tint: 0xf39c12,
            quantity: 20
        });
        
        // Play explosion sound
        const explosionSound = this.scene.sound.get('explosion');
        if (explosionSound) {
            explosionSound.play();
        }
        
        // Find all enemies within explosion radius
        const enemiesHit = this.scene.enemiesArray.filter(enemy => {
            if (!enemy.active) return false;
            
            const distance = Phaser.Math.Distance.Between(
                x, y,
                enemy.sprite.x, enemy.sprite.y
            );
            
            return distance <= radius;
        });
        
        // Damage all enemies within radius
        enemiesHit.forEach(enemy => {
            enemy.takeDamage(this.weapons.rocket.damage);
            
            // Add score for each enemy hit
            if (enemy.health <= 0) {
                this.scene.addScore(enemy.scoreValue);
            }
        });
        
        // Auto-destroy particles after animation completes
        this.scene.time.delayedCall(800, () => {
            explosion.destroy();
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
            100, 30, 'Viață', {
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
            100, 60, `Muniție: ${this.ammo}`, {
                font: '14px Arial',
                fill: '#ffffff'
            }
        ).setScrollFactor(0).setOrigin(0.5).setDepth(100);
    }
    
    createShockwaveDisplay() {
        // Create shockwave background
        this.shockwaveBg = this.scene.add.rectangle(
            100, 90, 200, 20, 0x000000, 0.7
        ).setScrollFactor(0).setDepth(100).setVisible(false);
        
        // Create shockwave bar (for cooldown)
        this.shockwaveBar = this.scene.add.rectangle(
            100, 90, 200, 20, 0x00ffff, 1
        ).setScrollFactor(0).setOrigin(0, 0.5).setDepth(100).setVisible(false);
        
        // Create shockwave text
        this.shockwaveText = this.scene.add.text(
            100, 90, 'Undă de Șoc [C]', {
                font: '14px Arial',
                fill: '#ffffff'
            }
        ).setScrollFactor(0).setOrigin(0.5).setDepth(100).setVisible(false);
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
        this.ammoText.setText(`Muniție: ${this.ammo}`);
        
        // Update shockwave display
        if (this.shockwaveUnlocked) {
            // Show shockwave UI elements if they're hidden
            if (!this.shockwaveBg.visible) {
                this.shockwaveBg.setVisible(true);
                this.shockwaveBar.setVisible(true);
                this.shockwaveText.setVisible(true);
            }
            
            // Calculate cooldown percentage
            const currentTime = this.scene.time.now;
            const timeSinceLastUse = currentTime - this.lastShockwaveUsed;
            const cooldownPercent = Math.min(timeSinceLastUse / this.shockwaveCooldown, 1);
            
            // Update cooldown bar
            this.shockwaveBar.width = 200 * cooldownPercent;
            
            // Update color based on cooldown status
            if (cooldownPercent >= 1) {
                this.shockwaveBar.fillColor = 0x00ffff; // Cyan when ready
                this.shockwaveText.setText('Undă de Șoc [C] - GATA');
            } else {
                this.shockwaveBar.fillColor = 0x3498db; // Blue when charging
                const remainingSeconds = Math.ceil((this.shockwaveCooldown - timeSinceLastUse) / 1000);
                this.shockwaveText.setText(`Undă de Șoc [C] - ${remainingSeconds}s`);
            }
        }
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
        
        // Destroy shockwave UI elements if they exist
        if (this.shockwaveBg) {
            this.shockwaveBg.destroy();
            this.shockwaveBar.destroy();
            this.shockwaveText.destroy();
        }
    }
}