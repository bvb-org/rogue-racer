/**
 * Upgrade Scene
 * Allows player to upgrade their vehicle between missions
 */
class UpgradeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UpgradeScene' });
    }

    init(data) {
        // Get score from previous scene
        this.score = data.score || 0;
        
        // Check if shockwave should be unlocked
        this.unlockShockwave = data.unlockShockwave || false;
        
        // Set available upgrade points if not already set
        if (this.game.gameState.availableUpgradePoints === undefined) {
            this.game.gameState.availableUpgradePoints = 2;
        }
    }

    create() {
        const { width, height } = this.cameras.main;
        
        // Background
        this.add.rectangle(0, 0, width, height, 0x0a0a0a).setOrigin(0);
        
        // Title
        this.add.text(width / 2, 50, 'UPGRADE YOUR VEHICLE', {
            font: 'bold 32px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Score display
        this.add.text(width / 2, 100, `Mission Score: ${this.score}`, {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Available upgrade points display
        this.add.text(width / 2, 130, `Available Upgrade Points: ${this.game.gameState.availableUpgradePoints}`, {
            font: '20px Arial',
            fill: '#f1c40f'
        }).setOrigin(0.5);
        
        // City completion status
        this.createCityStatus(width, 170);
        
        // Upgrade options
        this.createUpgradeOptions(width, 270);
        
        // Check if shockwave should be unlocked
        if (this.unlockShockwave) {
            // Unlock shockwave ability for all future levels
            this.time.delayedCall(1000, () => {
                this.showShockwaveUnlockMessage();
            });
        }
        
        // Continue button - position it at a fixed distance from the bottom of the screen
        // to ensure it's always visible
        this.createButton(
            width / 2,
            height - 50,
            'Continue',
            () => {
                // Save game state
                GameStorage.saveGame(this.game.gameState);
                
                // Return to menu
                this.scene.start('MenuScene');
            }
        );
        
        // Play menu music
        let menuMusic = this.sound.get('menu-music');
        if (!menuMusic) {
            menuMusic = this.sound.add('menu-music', { loop: true, volume: 0.5 });
        }
        if (!menuMusic.isPlaying) {
            menuMusic.play();
        }
    }
    
    createCityStatus(x, y) {
        // Create city completion status
        this.add.text(x / 2, y, 'City Status:', {
            font: 'bold 20px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        const cities = this.game.gameState.cities;
        const spacing = 40;
        
        cities.forEach((city, index) => {
            // Check if mission exists before accessing its completed property
            const completed = this.game.gameState.missions[city] ? this.game.gameState.missions[city].completed : false;
            const color = completed ? '#2ecc71' : '#e74c3c';
            const status = completed ? 'Completed' : 'Incomplete';
            
            this.add.text(x / 2, y + (index + 1) * spacing, `${city}: ${status}`, {
                font: '18px Arial',
                fill: color
            }).setOrigin(0.5);
        });
        
        // Check if all cities are completed
        // Check if mission exists before accessing its completed property
        const allCompleted = cities.every(city =>
            this.game.gameState.missions[city] ? this.game.gameState.missions[city].completed : false
        );
        
        if (allCompleted) {
            this.add.text(x / 2, y + (cities.length + 1) * spacing, 'All missions completed!', {
                font: 'bold 20px Arial',
                fill: '#f1c40f'
            }).setOrigin(0.5);
        }
    }
    
    createUpgradeOptions(x, y) {
        // Create upgrade options
        this.add.text(x / 2, y, 'Upgrade Your Vehicle:', {
            font: 'bold 20px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        const upgrades = [
            { key: 'speed', name: 'Speed', description: 'Increases vehicle speed' },
            { key: 'fireRate', name: 'Fire Rate', description: 'Increases weapon fire rate' },
            { key: 'ammo', name: 'Ammo Capacity', description: 'Increases starting ammo' },
            { key: 'health', name: 'Health', description: 'Increases vehicle health' }
        ];
        
        const spacing = 70;
        const buttonWidth = 200;
        const descWidth = 200;
        const levelWidth = 100;
        
        upgrades.forEach((upgrade, index) => {
            const yPos = y + (index + 1) * spacing;
            
            // Upgrade name and description
            this.add.text(x / 2 - 250, yPos, upgrade.name, {
                font: 'bold 18px Arial',
                fill: '#ffffff'
            }).setOrigin(0, 0.5);
            
            this.add.text(x / 2 - 250, yPos + 20, upgrade.description, {
                font: '14px Arial',
                fill: '#cccccc'
            }).setOrigin(0, 0.5);
            
            // Current level
            const currentLevel = this.game.gameState.upgrades[upgrade.key];
            const maxLevel = 5;
            
            this.add.text(x / 2 + 50, yPos, `Level: ${currentLevel}/${maxLevel}`, {
                font: '16px Arial',
                fill: '#ffffff'
            }).setOrigin(0, 0.5);
            
            // Level bar
            this.add.rectangle(x / 2 + 150, yPos, 100, 15, 0x333333).setOrigin(0, 0.5);
            
            if (currentLevel > 0) {
                this.add.rectangle(
                    x / 2 + 150, yPos,
                    100 * (currentLevel / maxLevel), 15,
                    0x3498db
                ).setOrigin(0, 0.5);
            }
            
            // Upgrade button (disabled if max level)
            if (currentLevel < maxLevel) {
                this.createButton(
                    x / 2 + 300,
                    yPos,
                    'Upgrade',
                    () => this.upgradeItem(upgrade.key),
                    currentLevel < maxLevel ? 0x27ae60 : 0x7f8c8d
                );
            } else {
                this.add.text(x / 2 + 300, yPos, 'MAXED', {
                    font: 'bold 16px Arial',
                    fill: '#f1c40f'
                }).setOrigin(0.5);
            }
        });
    }
    
    createButton(x, y, text, callback, color = 0x3498db) {
        const button = this.add.rectangle(x, y, 200, 50, color, 1).setInteractive();
        const buttonText = this.add.text(x, y, text, {
            font: '18px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        button.on('pointerover', () => {
            button.setFillStyle(0x2980b9);
        });
        
        button.on('pointerout', () => {
            button.setFillStyle(color);
        });
        
        button.on('pointerdown', () => {
            button.setFillStyle(0x1c6ea4);
        });
        
        button.on('pointerup', () => {
            button.setFillStyle(0x2980b9);
            callback();
        });
        
        return button;
    }
    
    upgradeItem(key) {
        // Get current level
        const currentLevel = this.game.gameState.upgrades[key];
        const maxLevel = 5;
        
        // Check if already at max level
        if (currentLevel >= maxLevel) {
            this.showMessage('Already at maximum level!');
            return;
        }
        
        // Check if player has available upgrade points
        if (this.game.gameState.availableUpgradePoints <= 0) {
            this.showMessage('No upgrade points available!');
            return;
        }
        
        // Increase level and decrease available points
        this.game.gameState.upgrades[key]++;
        this.game.gameState.availableUpgradePoints--;
        
        // Update player stats based on upgrade
        switch (key) {
            case 'speed':
                this.game.gameState.playerStats.speed += 0.2;
                break;
            case 'fireRate':
                this.game.gameState.playerStats.fireRate += 0.2;
                break;
            case 'ammo':
                this.game.gameState.playerStats.ammo += 25;
                break;
            case 'health':
                this.game.gameState.playerStats.health += 25;
                break;
        }
        
        // Play upgrade sound
        this.sound.play('pickup');
        
        // Show upgrade message
        this.showMessage(`${key} upgraded!`);
        
        // Save game
        GameStorage.saveGame(this.game.gameState);
        
        // Refresh scene to show updated values
        this.scene.restart({ score: this.score });
    }
    
    showMessage(text, duration = 2000) {
        const { width, height } = this.cameras.main;
        
        // Create message text
        const message = this.add.text(
            width / 2,
            height / 2,
            text,
            {
                font: 'bold 24px Arial',
                fill: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setDepth(100);
        
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
    
    showShockwaveUnlockMessage() {
        const { width, height } = this.cameras.main;
        
        // Create a semi-transparent background
        const bg = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.8)
            .setDepth(200);
        
        // Create unlock message container
        const container = this.add.container(width/2, height/2).setDepth(201);
        
        // Create message background
        const messageBg = this.add.rectangle(0, 0, 500, 300, 0x333333)
            .setStrokeStyle(4, 0x00ffff);
        container.add(messageBg);
        
        // Create title
        const title = this.add.text(0, -120, 'NEW ABILITY UNLOCKED!', {
            font: 'bold 28px Arial',
            fill: '#00ffff'
        }).setOrigin(0.5);
        container.add(title);
        
        // Create shockwave icon (using a circle as placeholder)
        const icon = this.add.circle(0, -50, 40, 0x00ffff, 0.8);
        container.add(icon);
        
        // Create pulse animation for the icon
        this.tweens.add({
            targets: icon,
            scale: { from: 0.8, to: 1.2 },
            alpha: { from: 0.8, to: 0.4 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        // Create description
        const description = this.add.text(0, 30,
            "SHOCKWAVE\n\nDestroy all enemies around you with a powerful shockwave.\n\nPress 'C' key to activate.\n\nCooldown: 10 seconds", {
            font: '18px Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        container.add(description);
        
        // Create continue button
        const button = this.add.rectangle(0, 120, 200, 50, 0x00ffff)
            .setInteractive();
        container.add(button);
        
        const buttonText = this.add.text(0, 120, 'CONTINUE', {
            font: 'bold 18px Arial',
            fill: '#000000'
        }).setOrigin(0.5);
        container.add(buttonText);
        
        // Add hover effect
        button.on('pointerover', () => {
            button.setFillStyle(0x66ffff);
        });
        
        button.on('pointerout', () => {
            button.setFillStyle(0x00ffff);
        });
        
        // Add click effect
        button.on('pointerdown', () => {
            button.setFillStyle(0x009999);
        });
        
        // Close dialog when continue is clicked
        button.on('pointerup', () => {
            // Remove dialog
            bg.destroy();
            container.destroy();
            
            // Set shockwave as unlocked in game state
            this.game.gameState.shockwaveUnlocked = true;
            GameStorage.saveGame(this.game.gameState);
        });
    }
}