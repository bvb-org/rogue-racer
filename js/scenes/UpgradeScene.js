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
        
        // Check if rocket should be unlocked
        this.unlockRocket = data.unlockRocket || false;
        
        // Check if laser should be unlocked
        this.unlockLaser = data.unlockLaser || false;
        
        // Set available upgrade points if not already set
        if (this.game.gameState.availableUpgradePoints === undefined) {
            this.game.gameState.availableUpgradePoints = 2;
        }
    }

    create() {
        const { width, height } = this.cameras.main;
        
        // Background
        this.add.rectangle(0, 0, width, height, 0x0a0a0a).setOrigin(0);
        
        // Add a subtle grid pattern to the background
        for (let x = 0; x < width; x += 50) {
            this.add.line(0, 0, x, 0, x, height, 0x222222).setOrigin(0);
        }
        for (let y = 0; y < height; y += 50) {
            this.add.line(0, 0, 0, y, width, y, 0x222222).setOrigin(0);
        }
        
        // Title with a decorative underline
        this.add.text(width / 2, 40, 'ÎMBUNĂTĂȚEȘTE VEHICULUL', {
            font: 'bold 32px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Decorative underline
        const underline = this.add.rectangle(width / 2, 65, 400, 3, 0x3498db).setOrigin(0.5);
        
        // Score display
        this.add.text(width / 2, 90, `Scor Misiune: ${this.score}`, {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Available upgrade points display with highlight
        const pointsText = `Puncte Disponibile: ${this.game.gameState.availableUpgradePoints}`;
        const pointsDisplay = this.add.text(width / 2, 120, pointsText, {
            font: 'bold 20px Arial',
            fill: '#f1c40f'
        }).setOrigin(0.5);
        
        // Add a subtle pulse animation to the upgrade points text
        this.tweens.add({
            targets: pointsDisplay,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // City completion status - positioned on the left side
        this.createCityStatus(width, 180);
        
        // Upgrade options - positioned on the right side
        this.createUpgradeOptions(width, 180);
        
        // Check if shockwave should be unlocked
        if (this.unlockShockwave) {
            // Unlock shockwave ability for all future levels
            this.time.delayedCall(1000, () => {
                this.showShockwaveUnlockMessage();
            });
        }
        
        // Check if rocket should be unlocked
        if (this.unlockRocket) {
            // Unlock rocket weapon
            this.time.delayedCall(1000, () => {
                this.showRocketUnlockMessage();
            });
        }
        
        // Check if laser should be unlocked
        if (this.unlockLaser) {
            // Unlock laser weapon
            this.time.delayedCall(1000, () => {
                this.showLaserUnlockMessage();
            });
        }
        
        // Continue button - position it at a fixed distance from the bottom of the screen
        // to ensure it's always visible
        this.createButton(
            width / 2,
            height - 50,
            'Continuă',
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
        // Create city completion status - positioned on the left side
        const leftSideX = x * 0.25; // 1/4 of screen width
        
        this.add.text(leftSideX, y, 'Starea Orașelor:', {
            font: 'bold 22px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        const cities = this.game.gameState.cities;
        const spacing = 35; // Slightly reduced spacing
        
        // Create a background panel for city statuses
        const panelHeight = (cities.length + 1) * spacing + 40; // Increased panel height
        this.add.rectangle(leftSideX, y + panelHeight/2 + 10, 250, panelHeight, 0x222222, 0.5)
            .setOrigin(0.5)
            .setStrokeStyle(1, 0x444444);
        
        cities.forEach((city, index) => {
            // Check if mission exists before accessing its completed property
            const completed = this.game.gameState.missions[city] ? this.game.gameState.missions[city].completed : false;
            const color = completed ? '#2ecc71' : '#e74c3c';
            const status = completed ? 'Completat' : 'Necompletat';
            
            // Increased the y offset to move cities lower (from y + 20 to y + 45)
            this.add.text(leftSideX, y + 45 + (index) * spacing, `${city}: ${status}`, {
                font: '18px Arial',
                fill: color
            }).setOrigin(0.5);
        });
        
        // Check if all cities are completed
        const allCompleted = cities.every(city =>
            this.game.gameState.missions[city] ? this.game.gameState.missions[city].completed : false
        );
        
        if (allCompleted) {
            this.add.text(leftSideX, y + 45 + (cities.length) * spacing, 'Toate misiunile completate!', {
                font: 'bold 20px Arial',
                fill: '#f1c40f'
            }).setOrigin(0.5);
        }
    }
    
    createUpgradeOptions(x, y) {
        // Create upgrade options - positioned on the right side
        const rightSideX = x * 0.75; // 3/4 of screen width
        
        this.add.text(rightSideX, y, 'Îmbunătățește Vehiculul Tău:', {
            font: 'bold 22px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        const upgrades = [
            { key: 'speed', name: 'Viteză', description: 'Crește viteza vehiculului' },
            { key: 'fireRate', name: 'Rată de Tragere', description: 'Crește rata de tragere a armei' },
            { key: 'ammo', name: 'Capacitate Muniție', description: 'Crește muniția inițială' },
            { key: 'health', name: 'Viață', description: 'Crește viața vehiculului' }
        ];
        
        const spacing = 85; // Increased spacing between upgrade options
        const panelWidth = 450;
        const panelHeight = upgrades.length * spacing + 40;
        
        // Create a background panel for upgrades
        this.add.rectangle(rightSideX, y + panelHeight/2 + 20, panelWidth, panelHeight, 0x222222, 0.5)
            .setOrigin(0.5)
            .setStrokeStyle(1, 0x444444);
        
        upgrades.forEach((upgrade, index) => {
            const yPos = y + 40 + (index) * spacing;
            
            // Upgrade name and description
            this.add.text(rightSideX - 200, yPos, upgrade.name, {
                font: 'bold 18px Arial',
                fill: '#ffffff'
            }).setOrigin(0, 0.5);
            
            this.add.text(rightSideX - 200, yPos + 20, upgrade.description, {
                font: '14px Arial',
                fill: '#cccccc'
            }).setOrigin(0, 0.5);
            
            // Current level
            const currentLevel = this.game.gameState.upgrades[upgrade.key];
            const maxLevel = 5;
            
            this.add.text(rightSideX - 10, yPos, `Nivel: ${currentLevel}/${maxLevel}`, {
                font: '16px Arial',
                fill: '#ffffff'
            }).setOrigin(0, 0.5);
            
            // Level bar
            const progressBarWidth = 100;
            const progressBarX = rightSideX + 90;
            this.add.rectangle(progressBarX, yPos, progressBarWidth, 15, 0x333333).setOrigin(0, 0.5);
            
            if (currentLevel > 0) {
                this.add.rectangle(
                    progressBarX, yPos,
                    progressBarWidth * (currentLevel / maxLevel), 15,
                    0x3498db
                ).setOrigin(0, 0.5);
            }
            
            // Upgrade button (disabled if max level) - positioned below the progress bar
            if (currentLevel < maxLevel) {
                // Create a button with the same width as the progress bar
                const button = this.add.rectangle(
                    progressBarX + progressBarWidth/2, // Center the button under the progress bar
                    yPos + 25, // Position below the progress bar
                    progressBarWidth, // Same width as progress bar
                    30, // Slightly shorter height
                    0x27ae60,
                    1
                ).setInteractive();
                
                const buttonText = this.add.text(
                    progressBarX + progressBarWidth/2,
                    yPos + 25,
                    'Upgrade',
                    {
                        font: '16px Arial',
                        fill: '#ffffff'
                    }
                ).setOrigin(0.5);
                
                // Add hover and click effects
                button.on('pointerover', () => button.setFillStyle(0x2ecc71));
                button.on('pointerout', () => button.setFillStyle(0x27ae60));
                button.on('pointerdown', () => button.setFillStyle(0x219653));
                button.on('pointerup', () => {
                    button.setFillStyle(0x2ecc71);
                    this.upgradeItem(upgrade.key);
                });
            } else {
                this.add.text(progressBarX + progressBarWidth/2, yPos + 25, 'MAXIM', {
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
            this.showMessage('Deja la nivel maxim!');
            return;
        }
        
        // Check if player has available upgrade points
        if (this.game.gameState.availableUpgradePoints <= 0) {
            this.showMessage('Nu mai sunt disponibile!');
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
        // Translate upgrade key names
        const keyTranslations = {
            'speed': 'Viteză',
            'fireRate': 'Rată de Tragere',
            'ammo': 'Muniție',
            'health': 'Viață'
        };
        const translatedKey = keyTranslations[key] || key;
        this.showMessage(`${translatedKey} îmbunătățit!`);
        
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
        const title = this.add.text(0, -120, 'ABILITATE NOUĂ DEBLOCATĂ!', {
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
            "UNDĂ DE ȘOC\n\nDistruge toți inamicii din jurul tău cu o undă de șoc puternică.\n\nApasă tasta 'C' pentru a activa.\n\nTimpul de reîncărcare: 10 secunde", {
            font: '18px Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        container.add(description);
        
        // Create continue button
        const button = this.add.rectangle(0, 120, 200, 50, 0x00ffff)
            .setInteractive();
        container.add(button);
        
        const buttonText = this.add.text(0, 120, 'CONTINUĂ', {
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
    
    showRocketUnlockMessage() {
        const { width, height } = this.cameras.main;
        
        // Create a semi-transparent background
        const bg = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.8)
            .setDepth(200);
        
        // Create unlock message container
        const container = this.add.container(width/2, height/2).setDepth(201);
        
        // Create message background
        const messageBg = this.add.rectangle(0, 0, 500, 300, 0x333333)
            .setStrokeStyle(4, 0xe74c3c);
        container.add(messageBg);
        
        // Create title
        const title = this.add.text(0, -120, 'ARMĂ NOUĂ DEBLOCATĂ!', {
            font: 'bold 28px Arial',
            fill: '#e74c3c'
        }).setOrigin(0.5);
        container.add(title);
        
        // Create rocket icon (using a rectangle as placeholder)
        const icon = this.add.rectangle(0, -50, 20, 40, 0xe74c3c, 1);
        container.add(icon);
        
        // Create pulse animation for the icon
        this.tweens.add({
            targets: icon,
            scale: { from: 0.8, to: 1.2 },
            alpha: { from: 1, to: 0.7 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        // Create description
        const description = this.add.text(0, 30,
            "RACHETĂ\n\nLansează rachete explozive care provoacă daune în zonă.\n\nApasă tasta '2' pentru a selecta această armă.\n\nDaune: Mare, Viteză: Medie", {
            font: '18px Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        container.add(description);
        
        // Create continue button
        const button = this.add.rectangle(0, 120, 200, 50, 0xe74c3c)
            .setInteractive();
        container.add(button);
        
        const buttonText = this.add.text(0, 120, 'CONTINUĂ', {
            font: 'bold 18px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        container.add(buttonText);
        
        // Add hover effect
        button.on('pointerover', () => {
            button.setFillStyle(0xc0392b);
        });
        
        button.on('pointerout', () => {
            button.setFillStyle(0xe74c3c);
        });
        
        // Add click effect
        button.on('pointerdown', () => {
            button.setFillStyle(0xa93226);
        });
        
        // Close dialog when continue is clicked
        button.on('pointerup', () => {
            // Remove dialog
            bg.destroy();
            container.destroy();
            
            // Set rocket as unlocked in game state
            this.game.gameState.rocketUnlocked = true;
            GameStorage.saveGame(this.game.gameState);
        });
    }
    
    showLaserUnlockMessage() {
        const { width, height } = this.cameras.main;
        
        // Create a semi-transparent background
        const bg = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.8)
            .setDepth(200);
        
        // Create unlock message container
        const container = this.add.container(width/2, height/2).setDepth(201);
        
        // Create message background
        const messageBg = this.add.rectangle(0, 0, 500, 300, 0x333333)
            .setStrokeStyle(4, 0x3498db);
        container.add(messageBg);
        
        // Create title
        const title = this.add.text(0, -120, 'ARMĂ NOUĂ DEBLOCATĂ!', {
            font: 'bold 28px Arial',
            fill: '#3498db'
        }).setOrigin(0.5);
        container.add(title);
        
        // Create laser icon (using a rectangle as placeholder)
        const icon = this.add.rectangle(0, -50, 10, 60, 0x3498db, 1);
        container.add(icon);
        
        // Create pulse animation for the icon
        this.tweens.add({
            targets: icon,
            scale: { from: 0.8, to: 1.2 },
            alpha: { from: 1, to: 0.7 },
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        // Create description
        const description = this.add.text(0, 30,
            "LASER\n\nTrage cu raze laser rapide și precise.\n\nApasă tasta '3' pentru a selecta această armă.\n\nDaune: Medii, Viteză: Mare", {
            font: '18px Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        container.add(description);
        
        // Create continue button
        const button = this.add.rectangle(0, 120, 200, 50, 0x3498db)
            .setInteractive();
        container.add(button);
        
        const buttonText = this.add.text(0, 120, 'CONTINUĂ', {
            font: 'bold 18px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        container.add(buttonText);
        
        // Add hover effect
        button.on('pointerover', () => {
            button.setFillStyle(0x2980b9);
        });
        
        button.on('pointerout', () => {
            button.setFillStyle(0x3498db);
        });
        
        // Add click effect
        button.on('pointerdown', () => {
            button.setFillStyle(0x1f618d);
        });
        
        // Close dialog when continue is clicked
        button.on('pointerup', () => {
            // Remove dialog
            bg.destroy();
            container.destroy();
            
            // Set laser as unlocked in game state
            this.game.gameState.laserUnlocked = true;
            GameStorage.saveGame(this.game.gameState);
        });
    }
}