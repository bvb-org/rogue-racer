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
        
        // Set up camera to follow player
        this.cameras.main.startFollow(this.player.sprite);
        this.cameras.main.setZoom(0.8);
        
        // Set up collisions
        this.physics.add.collider(this.player.sprite, trackObjects.obstacles, this.handlePlayerObstacleCollision, null, this);
        this.physics.add.collider(this.player.sprite, this.enemyGroup, this.handlePlayerEnemyCollision, null, this);
        this.physics.add.overlap(this.player.bullets, this.enemyGroup, this.handleBulletEnemyCollision, null, this);
        this.physics.add.overlap(this.player.sprite, this.pickups, this.handlePlayerPickupCollision, null, this);
        
        // Create finish line collision
        const finishPos = this.track.getFinishPosition();
        this.finishLine = this.physics.add.sprite(finishPos.x, finishPos.y, 'road').setVisible(false);
        this.finishLine.setSize(this.track.tileSize * 2, this.track.tileSize * 2);
        this.physics.add.overlap(this.player.sprite, this.finishLine, this.handleFinishLineCollision, null, this);
        
        // Create UI
        this.createUI();
        
        // Start enemy spawning
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
        // Skip update if game is over
        if (this.gameOver) return;
        
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
            `Score: ${this.score}`,
            {
                font: '18px Arial',
                fill: '#ffffff'
            }
        ).setScrollFactor(0).setOrigin(1, 0.5).setDepth(100);
        
        // Create city text
        this.cityText = this.add.text(
            this.cameras.main.width / 2, 30,
            `City: ${this.currentCity}`,
            {
                font: '18px Arial',
                fill: '#ffffff'
            }
        ).setScrollFactor(0).setOrigin(0.5).setDepth(100);
        
        // Create mission text
        this.missionText = this.add.text(
            this.cameras.main.width / 2, 60,
            'Mission: Reach the finish line',
            {
                font: '16px Arial',
                fill: '#ffffff'
            }
        ).setScrollFactor(0).setOrigin(0.5).setDepth(100);
    }
    
    updateUI() {
        // Update score text
        this.scoreText.setText(`Score: ${this.score}`);
    }
    
    startEnemySpawning() {
        // Determine spawn rates based on city
        let carSpawnRate, droneSpawnRate;
        
        switch (this.currentCity) {
            case 'Bucharest':
                carSpawnRate = 5000;
                droneSpawnRate = 7000;
                break;
            case 'Brașov':
                carSpawnRate = 4000;
                droneSpawnRate = 6000;
                break;
            case 'Cluj-Napoca':
                carSpawnRate = 3000;
                droneSpawnRate = 5000;
                break;
            default:
                carSpawnRate = 5000;
                droneSpawnRate = 7000;
        }
        
        // Start car spawning
        this.carSpawnTimer = this.time.addEvent({
            delay: carSpawnRate,
            callback: () => {
                if (!this.gameOver && this.player && this.player.sprite.active) {
                    const enemy = Enemy.spawnEnemy(this, 'enemy-car');
                    if (enemy) {
                        this.enemiesArray.push(enemy);
                        this.enemyGroup.add(enemy.sprite);
                        this.enemies.add(enemy.sprite); // Add to the enemies group as well
                    }
                }
            },
            callbackScope: this,
            loop: true
        });
        
        // Start drone spawning
        this.droneSpawnTimer = this.time.addEvent({
            delay: droneSpawnRate,
            callback: () => {
                if (!this.gameOver && this.player && this.player.sprite.active) {
                    const enemy = Enemy.spawnEnemy(this, 'drone');
                    if (enemy) {
                        this.enemiesArray.push(enemy);
                        this.enemyGroup.add(enemy.sprite);
                        this.enemies.add(enemy.sprite); // Add to the enemies group as well
                    }
                }
            },
            callbackScope: this,
            loop: true
        });
    }
    
    stopEnemySpawning() {
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
        // Deactivate bullet
        bullet.setActive(false);
        bullet.setVisible(false);
        
        // Enemy takes damage
        if (enemy.enemyRef) {
            enemy.enemyRef.takeDamage(1);
        }
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
        this.showMessage(`+${pickup.pickupValue} ${pickup.pickupType}!`);
        
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
        
        // Save game
        GameStorage.saveGame(this.game.gameState);
        
        // Show mission complete message
        this.showMessage('Mission Complete!', 3000);
        
        // Add bonus score
        const bonus = 1000;
        this.addScore(bonus);
        this.showMessage(`Bonus: +${bonus} points`, 3000);
        
        // Transition to upgrade scene after delay
        this.time.delayedCall(3000, () => {
            // Stop game music
            if (this.gameMusic) {
                this.gameMusic.stop();
            }
            
            // Start upgrade scene
            this.scene.start('UpgradeScene', { score: this.score });
        });
    }
    
    playerDied() {
        if (this.gameOver) return;
        
        // Set game over
        this.gameOver = true;
        
        // Stop enemy spawning
        this.stopEnemySpawning();
        
        // Show game over message
        this.showMessage('Game Over', 3000);
        
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