/**
 * Boss Scene
 * Final boss level where the player faces a larger, more powerful enemy
 */
class BossScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BossScene' });
    }

    create() {
        // Initialize game variables
        this.score = 0;
        this.gameOver = false;
        this.missionComplete = false;
        this.isBossDefeated = false;
        this.enemySpawnTimer = null;
        this.enemiesArray = []; // Array to track enemy objects
        this.gameStarted = false; // Flag to track if game has started
        
        // Create groups
        this.enemies = this.physics.add.group();
        this.enemyGroup = this.physics.add.group();
        this.pickups = this.physics.add.group();
        this.bossProjectiles = this.physics.add.group();
        
        // Generate track for boss arena (using Vaslui as base)
        this.currentCity = 'Vaslui';
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
        this.physics.add.collider(this.player.sprite, this.bossProjectiles, this.handlePlayerProjectileCollision, null, this);
        
        // Add overlap check for grass tiles
        this.physics.add.overlap(this.player.sprite, this.track.grassTiles, this.handlePlayerOnGrass, null, this);
        // Add overlap check for road tiles
        this.physics.add.overlap(this.player.sprite, this.track.roadTiles, this.handlePlayerOnRoad, null, this);
        
        // Create UI
        this.createUI();
        
        // Start the game immediately
        this.gameStarted = true;
        
        // Spawn the boss
        this.spawnBoss();
        
        // Play game music with different rate for boss battle
        this.sound.stopByKey('menu-music');
        this.gameMusic = this.sound.add('game-music', {
            loop: true,
            volume: 0.4
        });
        this.gameMusic.setRate(0.9);
        this.gameMusic.play();
        
        // Show intro message
        this.showMessage('BOSS FINAL!', 3000);
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
                if (enemy instanceof Boss) {
                    enemy.update(time);
                } else {
                    enemy.update();
                }
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
        
        // Check if boss is defeated but mission not yet complete
        if (this.boss && !this.boss.active && !this.missionComplete && this.isBossDefeated) {
            this.completeBossMission();
        }
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
            `Bătălia Finală`,
            {
                font: '18px Arial',
                fill: '#ffffff'
            }
        ).setScrollFactor(0).setOrigin(0.5).setDepth(100);
        
        // Create mission text
        this.missionText = this.add.text(
            this.cameras.main.width / 2, 60,
            'Misiune: Înfrânge Marele Boss!',
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
    
    spawnBoss() {
        // Calculate spawn position (in front of player)
        const playerAngle = this.player.sprite.rotation;
        const spawnDistance = 500;
        const spawnX = this.player.sprite.x + Math.cos(playerAngle) * spawnDistance;
        const spawnY = this.player.sprite.y + Math.sin(playerAngle) * spawnDistance;
        
        // Create boss
        this.boss = new Boss(this, spawnX, spawnY);
        
        // Add to enemy groups for collision detection
        this.enemiesArray.push(this.boss);
        this.enemyGroup.add(this.boss.sprite);
        this.enemies.add(this.boss.sprite);
        
        // Show boss introduction
        this.time.delayedCall(1000, () => {
            this.boss.showDialogue("Așa deci, tu ești cel care încearcă să salveze România?", true);
        });
        
        this.time.delayedCall(4000, () => {
            this.boss.showDialogue("Eu sunt Marele Boss și voi prelua controlul asupra țării!", true);
        });
    }
    
    handlePlayerProjectileCollision(player, projectile) {
        // Player takes damage from projectile
        if (this.player) {
            this.player.takeDamage(10);
            
            // Add collision effect
            this.addCollisionEffect(projectile.x, projectile.y);
            
            // Destroy projectile
            projectile.destroy();
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
            
            // Check if this was the boss being hit
            if (enemy.enemyRef instanceof Boss && enemy.enemyRef.health <= 0) {
                this.isBossDefeated = true;
            }
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
        const pickupTypeRo = pickup.pickupType === 'ammo' ? 'muniție' : 'viață';
        this.showMessage(`+${pickup.pickupValue} ${pickupTypeRo}!`);
        
        // Destroy pickup
        pickup.destroy();
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
    
    completeBossMission() {
        // Set mission as complete
        this.missionComplete = true;
        
        // Show victory message
        this.showMessage('ROMÂNIA SALVATĂ!', 5000);
        
        // Award bonus score
        const bonus = 10000;
        this.addScore(bonus);
        this.showMessage(`Bonus: +${bonus} puncte`, 3000);
        
        // Mark all missions as completed
        Object.keys(this.game.gameState.missions).forEach(city => {
            this.game.gameState.missions[city].completed = true;
        });
        
        // Mark boss as defeated
        this.game.gameState.bossDefeated = true;
        
        // Award 5 upgrade points for defeating the boss
        this.game.gameState.availableUpgradePoints += 5;
        
        // Save game
        GameStorage.saveGame(this.game.gameState);
        
        // Transition to menu scene after delay
        this.time.delayedCall(8000, () => {
            // Stop game music
            if (this.gameMusic) {
                this.gameMusic.stop();
            }
            
            // Show congratulations message
            this.showMessage('Felicitări! Ai salvat România!', 3000);
            
            // Start menu scene
            this.time.delayedCall(3000, () => {
                this.scene.start('MenuScene');
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
    
    playerDied() {
        if (this.gameOver) return;
        
        // Set game over
        this.gameOver = true;
        
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