/**
 * Game Scene
 * Main gameplay scene where the player races through the track
 */
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // Get current city
        this.currentCity = this.game.gameState.currentCity;
        
        // Initialize game variables
        this.score = 0;
        this.gameOver = false;
        this.missionComplete = false;
        this.enemySpawnTimer = null;
        this.enemiesArray = []; // Array to track enemy objects
        this.gameStarted = false; // Flag to track if game has started
        
        // Create groups
        this.enemies = this.physics.add.group(); // Changed to a group instead of array
        this.enemyGroup = this.physics.add.group();
        this.pickups = this.physics.add.group();
        
        // Generate track for current city
        this.track = new Track(this, this.currentCity);
        const trackObjects = this.track.render();
        
        // Create player at track start position
        const startPos = this.track.getStartPosition();
        this.player = new Player(this, startPos.x, startPos.y);
        
        // Check if shockwave is unlocked in game state
        if (this.game.gameState.shockwaveUnlocked) {
            this.player.shockwaveUnlocked = true;
        }
        
        // Set up camera to follow player
        this.cameras.main.startFollow(this.player.sprite);
        this.cameras.main.setZoom(0.85);
        
        // Set up collisions
        this.physics.add.collider(this.player.sprite, trackObjects.obstacles, this.handlePlayerObstacleCollision, null, this);
        this.physics.add.collider(this.player.sprite, this.enemyGroup, this.handlePlayerEnemyCollision, null, this);
        this.physics.add.overlap(this.player.bullets, this.enemyGroup, this.handleBulletEnemyCollision, null, this);
        this.physics.add.overlap(this.player.sprite, this.pickups, this.handlePlayerPickupCollision, null, this);
        
        // Add overlap check for grass tiles
        this.physics.add.overlap(this.player.sprite, this.track.grassTiles, this.handlePlayerOnGrass, null, this);
        // Add overlap check for road tiles
        this.physics.add.overlap(this.player.sprite, this.track.roadTiles, this.handlePlayerOnRoad, null, this);
        
        // Create finish line collision
        const finishPos = this.track.getFinishPosition();
        this.finishLine = this.physics.add.sprite(finishPos.x, finishPos.y, 'road').setVisible(false);
        this.finishLine.setSize(this.track.tileSize * 2, this.track.tileSize * 2);
        this.physics.add.overlap(this.player.sprite, this.finishLine, this.handleFinishLineCollision, null, this);
        // Create UI
        this.createUI();
        
        // Start the game immediately
        this.gameStarted = true;
        this.startEnemySpawning();
        
        // Play game music
        this.sound.stopByKey('menu-music');
        this.gameMusic = this.sound.add('game-music', {
            loop: true,
            volume: 0.3
        });
        this.gameMusic.play();
    }
    
    update(time, delta) {
        // Skip update if game is over or not started
        if (this.gameOver || !this.gameStarted) return;
        
        // Update player
        if (this.player) {
            this.player.update(time, delta);
        }
        // Update enemies
        this.enemiesArray.forEach(enemy => {
            if (enemy.active) {
                enemy.update();
            }
        });
        
        // Clean up destroyed enemies
        this.enemiesArray = this.enemiesArray.filter(enemy => enemy.active);
        
        // Clean up destroyed enemies from the physics group
        const inactiveEnemies = this.enemies.getChildren().filter(enemy => !enemy.active);
        inactiveEnemies.forEach(enemy => {
            this.enemies.remove(enemy);
        });
        
        // Update UI
        this.updateUI();
    }
    
    createUI() {
        // Create score text
        this.scoreText = this.add.text(
            this.cameras.main.width - 20, 30,
            `Scor: ${this.score}`,
            {
                font: '18px Arial',
                fill: '#ffffff'
            }
        ).setScrollFactor(0).setOrigin(1, 0.5).setDepth(100);
        
        // Create city text
        this.cityText = this.add.text(
            this.cameras.main.width / 2, 30,
            `Oraș: ${this.currentCity}`,
            {
                font: '18px Arial',
                fill: '#ffffff'
            }
        ).setScrollFactor(0).setOrigin(0.5).setDepth(100);
        
        // Create mission text
        this.missionText = this.add.text(
            this.cameras.main.width / 2, 60,
            'Misiune: Ajunge la linia de finish',
            {
                font: '16px Arial',
                fill: '#ffffff'
            }
        ).setScrollFactor(0).setOrigin(0.5).setDepth(100);
    }
    
    updateUI() {
        // Update score text
        this.scoreText.setText(`Scor: ${this.score}`);
    }
    
    startEnemySpawning() {
        // Determine spawn rates and enemy types based on city
        let enemyTypes = [];
        let spawnRates = {};
        
        // Define enemy types and spawn rates for each city
        switch (this.currentCity) {
            case 'Bucharest':
                // First city - basic enemies only
                enemyTypes = ['enemy-car', 'drone'];
                spawnRates = {
                    'enemy-car': 2500,
                    'drone': 21000
                };
                break;
                
            case 'Brașov':
                // Second city - introduce fast cars
                enemyTypes = ['enemy-car', 'drone', 'fast-car'];
                spawnRates = {
                    'enemy-car': 2500,
                    'drone': 18000,
                    'fast-car': 4000
                };
                break;
                
            case 'Cluj-Napoca':
                // Third city - introduce tanks
                enemyTypes = ['enemy-car', 'drone', 'fast-car', 'tank'];
                spawnRates = {
                    'enemy-car': 2500,
                    'drone': 15000,
                    'fast-car': 3500,
                    'tank': 8000
                };
                break;
                
            case 'Timisoara':
                // Fourth city - introduce shooters
                enemyTypes = ['enemy-car', 'drone', 'fast-car', 'tank', 'shooter'];
                spawnRates = {
                    'enemy-car': 2500,
                    'drone': 12000,
                    'fast-car': 3000,
                    'tank': 7000,
                    'shooter': 10000
                };
                break;
                
            case 'Iasi':
                // Fifth city - more difficult
                enemyTypes = ['enemy-car', 'drone', 'fast-car', 'tank', 'shooter'];
                spawnRates = {
                    'enemy-car': 2000,
                    'drone': 9000,
                    'fast-car': 2500,
                    'tank': 6000,
                    'shooter': 8000
                };
                break;
                
            case 'Vaslui':
                // Final city - most difficult
                enemyTypes = ['enemy-car', 'drone', 'fast-car', 'tank', 'shooter'];
                spawnRates = {
                    'enemy-car': 1800,
                    'drone': 6000,
                    'fast-car': 2000,
                    'tank': 5000,
                    'shooter': 6000
                };
                break;
                
            default:
                // Default to Bucharest settings
                enemyTypes = ['enemy-car', 'drone'];
                spawnRates = {
                    'enemy-car': 2500,
                    'drone': 21000
                };
        }
        
        // Create spawn timers for each enemy type
        this.enemySpawnTimers = [];
        
        enemyTypes.forEach(enemyType => {
            const timer = this.time.addEvent({
                delay: spawnRates[enemyType],
                callback: () => {
                    if (!this.gameOver && this.player && this.player.sprite.active) {
                        const enemy = Enemy.spawnEnemy(this, enemyType);
                        if (enemy) {
                            this.enemiesArray.push(enemy);
                            this.enemyGroup.add(enemy.sprite);
                            this.enemies.add(enemy.sprite);
                        }
                    }
                },
                callbackScope: this,
                loop: true
            });
            
            this.enemySpawnTimers.push(timer);
        });
        
        // Show message about new enemy types
        if (this.currentCity === 'Brașov') {
            this.showMessage('Atenție! Mașini rapide în zonă!', 3000);
        } else if (this.currentCity === 'Cluj-Napoca') {
            this.showMessage('Atenție! Tancuri blindate în zonă!', 3000);
        } else if (this.currentCity === 'Timisoara') {
            this.showMessage('Atenție! Inamici cu arme în zonă!', 3000);
        }
    }
    
    stopEnemySpawning() {
        // Remove all enemy spawn timers
        if (this.enemySpawnTimers && this.enemySpawnTimers.length > 0) {
            this.enemySpawnTimers.forEach(timer => {
                if (timer) {
                    timer.remove();
                }
            });
            this.enemySpawnTimers = [];
        }
        
        // For backward compatibility
        if (this.carSpawnTimer) {
            this.carSpawnTimer.remove();
        }
        
        if (this.droneSpawnTimer) {
            this.droneSpawnTimer.remove();
        }
    }
    
    handlePlayerObstacleCollision(player, obstacle) {
        // Player takes damage from obstacle collision
        if (this.player) {
            this.player.takeDamage(5);
            
            // Add collision effect
            this.addCollisionEffect(obstacle.x, obstacle.y);
        }
    }
    
    handlePlayerEnemyCollision(player, enemy) {
        // Player takes damage from enemy collision
        if (this.player && enemy.enemyRef) {
            this.player.takeDamage(enemy.enemyRef.damage);
            
            // Enemy also takes damage
            enemy.enemyRef.takeDamage(1);
            
            // Add collision effect
            this.addCollisionEffect(enemy.x, enemy.y);
        }
    }
    
    handleBulletEnemyCollision(bullet, enemy) {
        // Get damage amount from bullet (set by player's weapon)
        const damage = bullet.damage || 1;
        
        // Special handling for rocket explosions
        if (bullet.weaponType === 'rocket') {
            // Create explosion at impact point
            this.createExplosion(bullet.x, bullet.y, bullet.explosionRadius || 100);
            
            // Find all enemies within explosion radius
            const explosionRadius = bullet.explosionRadius || 100;
            const enemiesInRadius = this.enemiesArray.filter(e => {
                if (!e.active) return false;
                
                const distance = Phaser.Math.Distance.Between(
                    bullet.x, bullet.y,
                    e.sprite.x, e.sprite.y
                );
                
                return distance <= explosionRadius;
            });
            
            // Damage all enemies in radius
            enemiesInRadius.forEach(e => {
                e.takeDamage(damage);
            });
        } else {
            // Standard bullet damage to single enemy
            if (enemy.enemyRef) {
                enemy.enemyRef.takeDamage(damage);
            }
        }
        
        // Deactivate bullet
        bullet.setActive(false);
        bullet.setVisible(false);
    }
    
    createExplosion(x, y, radius) {
        // Create explosion visual effect
        const explosion = this.add.particles(x, y, 'explosion', {
            speed: { min: 50, max: 200 },
            scale: { start: 1, end: 0 },
            lifespan: 800,
            blendMode: 'ADD',
            tint: 0xf39c12,
            quantity: 20
        });
        
        // Play explosion sound
        const explosionSound = this.sound.get('explosion');
        if (explosionSound) {
            explosionSound.play();
        } else {
            this.sound.play('crash');
        }
        
        // Create shockwave circle effect
        const shockwave = this.add.circle(x, y, 10, 0xf39c12, 0.7);
        shockwave.setDepth(20);
        
        // Animate the shockwave expanding outward
        this.tweens.add({
            targets: shockwave,
            radius: radius,
            alpha: 0,
            duration: 500,
            ease: 'Cubic.Out',
            onComplete: () => {
                shockwave.destroy();
            }
        });
        
        // Auto-destroy particles after animation completes
        this.time.delayedCall(800, () => {
            explosion.destroy();
        });
    }
    
    handlePlayerPickupCollision(player, pickup) {
        // Apply pickup effect
        if (pickup.pickupType === 'ammo') {
            this.player.addAmmo(pickup.pickupValue);
        } else if (pickup.pickupType === 'health') {
            this.player.heal(pickup.pickupValue);
        }
        
        // Play pickup sound
        this.sound.play('pickup');
        
        // Add score
        this.addScore(25);
        
        // Show pickup message
        const pickupTypeRo = pickup.pickupType === 'ammo' ? 'muniție' : 'viață';
        this.showMessage(`+${pickup.pickupValue} ${pickupTypeRo}!`);
        
        // Destroy pickup
        pickup.destroy();
    }
    
    handleFinishLineCollision(player, finishLine) {
        if (!this.missionComplete) {
            this.missionComplete = true;
            
            // Complete mission
            this.completeMission();
        }
    }
    
    addCollisionEffect(x, y) {
        // Create particle effect
        const particles = this.add.particles(x, y, 'bullet', {
            speed: { min: 50, max: 150 },
            scale: { start: 0.5, end: 0 },
            lifespan: 300,
            blendMode: 'ADD',
            quantity: 10
        });
        
        // Auto-destroy particles after animation completes
        this.time.delayedCall(300, () => {
            particles.destroy();
        });
    }
    
    addScore(amount) {
        this.score += amount;
    }
    
    showMessage(text, duration = 2000) {
        // Create message text
        const message = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 50,
            text,
            {
                font: 'bold 24px Arial',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setScrollFactor(0).setOrigin(0.5).setDepth(100);
        
        // Add fade out animation
        this.tweens.add({
            targets: message,
            alpha: { from: 1, to: 0 },
            duration: duration,
            onComplete: () => {
                message.destroy();
            }
        });
    }
    
    completeMission() {
        // Stop enemy spawning
        this.stopEnemySpawning();
        
        // Mark mission as completed
        this.game.gameState.missions[this.currentCity].completed = true;
        
        // Award 1 upgrade point per level completion
        this.game.gameState.availableUpgradePoints = 1;
        
        // Save game
        GameStorage.saveGame(this.game.gameState);
        
        // Show mission complete message
        this.showMessage('Misiune Completă!', 3000);
        
        // Add bonus score
        const bonus = 1000;
        this.addScore(bonus);
        this.showMessage(`Bonus: +${bonus} puncte`, 3000);
        
        // Check which city was completed to determine weapon unlocks
        const isBucharestCompleted = this.currentCity === 'Bucharest';
        const isBrasovCompleted = this.currentCity === 'Brașov';
        const isClujCompleted = this.currentCity === 'Cluj-Napoca';
        
        // Transition to upgrade scene after delay
        this.time.delayedCall(3000, () => {
            // Stop game music
            if (this.gameMusic) {
                this.gameMusic.stop();
            }
            
            // Start upgrade scene with appropriate unlock flags
            this.scene.start('UpgradeScene', {
                score: this.score,
                unlockShockwave: isBucharestCompleted,
                unlockRocket: isBrasovCompleted,
                unlockLaser: isClujCompleted && !this.game.gameState.laserUnlocked
            });
        });
    }
    
    handlePlayerOnGrass(player, grassTile) {
        // Set player on grass flag
        if (this.player) {
            this.player.isOnGrass = true;
        }
    }
    
    handlePlayerOnRoad(player, roadTile) {
        // Clear player on grass flag
        if (this.player) {
            this.player.isOnGrass = false;
        }
    }
    
    // showControlsDialog method has been moved to MenuScene
    
    playerDied() {
        if (this.gameOver) return;
        
        // Set game over
        this.gameOver = true;
        
        // Stop enemy spawning
        this.stopEnemySpawning();
        
        // Show game over message
        this.showMessage('Joc Terminat', 3000);
        
        // Transition to menu scene after delay
        this.time.delayedCall(3000, () => {
            // Stop game music
            if (this.gameMusic) {
                this.gameMusic.stop();
            }
            
            // Start menu scene
            this.scene.start('MenuScene');
        });
    }
}