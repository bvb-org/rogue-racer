/**
 * Menu Scene
 * Displays the main menu and handles game start
 */
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        
        // Background
        this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);
        
        // Title
        this.add.text(width / 2, height / 4, 'ROGUE RACER', {
            font: 'bold 48px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.add.text(width / 2, height / 4 + 60, 'Aventură de Curse în România', {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Game description
        this.add.text(width / 2, height / 4 + 110, 'Condu prin orașele României, evită obstacolele,\nînvinge inamicii și completează misiunile în această\naventură plină de acțiune!', {
            font: '16px Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Controls button
        this.createButton(
            width / 2,
            height / 4 + 170,
            'Controale',
            () => {
                this.showControlsDialog();
            }
        );
        
        // Add boss test button if enabled
        if (ENABLE_BOSS_TEST) {
            this.createButton(
                width / 2,
                height / 4 + 230,
                'BOSS TEST',
                () => {
                    this.startBossLevel();
                },
                0xe74c3c // Red color for boss button
            );
        }
        
        // City selection
        this.createCitySelection(width, height);
        
        // Continue game button (if save exists)
        const savedGame = GameStorage.loadGame();
        if (savedGame) {
            this.createButton(
                width / 2,
                height - 100,
                'Continuă Jocul',
                () => {
                    // Load the saved game state
                    this.game.gameState = savedGame;
                    
                    // Ensure all cities have corresponding mission entries
                    this.game.gameState.cities.forEach(city => {
                        if (!this.game.gameState.missions[city]) {
                            this.game.gameState.missions[city] = { completed: false };
                            console.log(`Added missing mission entry for ${city}`);
                        }
                    });
                    
                    this.startGame(savedGame.currentCity);
                }
            );
            
            // New game button
            this.createButton(
                width / 2,
                height - 40,
                'Joc Nou',
                () => {
                    // Reset game state
                    GameStorage.clearSave();
                    this.resetGameState();
                    this.startGame('Bucharest');
                }
            );
        } else {
            // Start game button (if no save exists)
            this.createButton(
                width / 2,
                height - 70,
                'Începe Jocul',
                () => {
                    this.resetGameState();
                    this.startGame('Bucharest');
                }
            );
        }
        
        // Play menu music
        let menuMusic = this.sound.get('menu-music');
        if (!menuMusic) {
            menuMusic = this.sound.add('menu-music', { loop: true, volume: 0.5 });
        }
        if (!menuMusic.isPlaying) {
            menuMusic.play();
        }
    }
    
    createCitySelection(width, height) {
        // City selection title
        this.add.text(width / 2, height / 2 - 40, 'Selectează Orașul:', {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // City buttons
        const cities = this.game.gameState.cities;
        const buttonWidth = 200;
        const spacing = 30;
        const totalWidth = cities.length * buttonWidth + (cities.length - 1) * spacing;
        const startX = (width - totalWidth) / 2 + buttonWidth / 2;
        
        cities.forEach((city, index) => {
            const x = startX + index * (buttonWidth + spacing);
            const y = height / 2 + 20;
            
            // Check if city is locked
            const isLocked = index > 0 && !this.game.gameState.missions[cities[index - 1]].completed;
            
            // Determine button color based on city
            let buttonColor = 0x3498db; // Default blue
            if (city === 'Iasi') {
                buttonColor = 0xf39c12; // Orange for Iasi
            } else if (city === 'Vaslui') {
                buttonColor = 0xe74c3c; // Red for Vaslui
            }
            
            // Create city button
            const button = this.createButton(
                x,
                y,
                city + (isLocked ? ' 🔒' : ''),
                () => {
                    if (!isLocked) {
                        this.startGame(city);
                    } else {
                        // Show "complete previous city" message
                        this.showMessage(`Completează ${cities[index - 1]} mai întâi!`);
                    }
                },
                isLocked ? 0x555555 : buttonColor
            );
            
            // Add completed indicator
            if (this.game.gameState.missions[city].completed) {
                this.add.text(x + 80, y, '✓', {
                    font: 'bold 24px Arial',
                    fill: '#2ecc71'
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
    
    showMessage(text, duration = 2000) {
        const { width, height } = this.cameras.main;
        const message = this.add.text(width / 2, height - 150, text, {
            font: '20px Arial',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        this.time.delayedCall(duration, () => {
            message.destroy();
        });
    }
    
    resetGameState() {
        // Reset game state to default values
        this.game.gameState = {
            currentCity: 'Bucharest',
            cities: ['Bucharest', 'Brașov', 'Cluj-Napoca', 'Timisoara', 'Iasi', 'Vaslui'],
            playerStats: {
                speed: 1,
                fireRate: 1,
                ammo: 50,
                health: 100
            },
            missions: {
                Bucharest: { completed: false },
                'Brașov': { completed: false },
                'Cluj-Napoca': { completed: false },
                'Timisoara': { completed: false },
                'Iasi': { completed: false },
                'Vaslui': { completed: false }
            },
            upgrades: {
                speed: 0,
                fireRate: 0,
                ammo: 0,
                health: 0
            }
        };
    }
    
    startGame(city) {
        // Stop menu music
        this.sound.stopByKey('menu-music');
        
        // Set current city
        this.game.gameState.currentCity = city;
        
        // If this is the first city (Bucharest), show the intro scene first
        if (city === 'Bucharest') {
            this.scene.start('IntroScene');
        } else {
            // For other cities, start the game scene directly
            this.scene.start('GameScene');
        }
    }
    
    startBossLevel() {
        // Stop menu music
        this.sound.stopByKey('menu-music');
        
        // Set player stats to be stronger for testing
        this.game.gameState.playerStats = {
            speed: 1.5,
            fireRate: 1.5,
            ammo: 100,
            health: 100
        };
        
        // Start the boss scene
        this.scene.start('BossScene');
    }
    
    showControlsDialog() {
        // Create a semi-transparent background
        const { width, height } = this.cameras.main;
        const bg = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7)
            .setInteractive()
            .setDepth(200);
        
        // Create controls dialog
        const dialogWidth = 400;
        const dialogHeight = 300;
        const dialog = this.add.rectangle(width/2, height/2, dialogWidth, dialogHeight, 0x333333)
            .setDepth(201);
            
        // Add dialog border
        const border = this.add.rectangle(width/2, height/2, dialogWidth, dialogHeight)
            .setStrokeStyle(2, 0xffffff)
            .setDepth(202);
        
        // Add title
        const title = this.add.text(width/2, height/2 - 120, 'CONTROALE', {
            font: 'bold 24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5).setDepth(202);
        
        // Add controls text
        const controlsText = this.add.text(width/2, height/2 - 50,
            '↑  Accelerează\n↓  Frânează/Marșarier\n←  Virează Stânga\n→  Virează Dreapta\nSPACE - Trage\nC - Undă de șoc', {
            font: '18px Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setDepth(202);
        
        // Add OK button
        const buttonWidth = 100;
        const buttonHeight = 40;
        const button = this.add.rectangle(width/2, height/2 + 80, buttonWidth, buttonHeight, 0x3498db)
            .setInteractive()
            .setDepth(202);
            
        const buttonText = this.add.text(width/2, height/2 + 80, 'OK', {
            font: 'bold 18px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5).setDepth(203);
        
        // Add hover effect
        button.on('pointerover', () => {
            button.setFillStyle(0x2980b9);
        });
        
        button.on('pointerout', () => {
            button.setFillStyle(0x3498db);
        });
        
        // Add click effect
        button.on('pointerdown', () => {
            button.setFillStyle(0x1c6ea4);
        });
        
        // Close dialog when OK is clicked
        button.on('pointerup', () => {
            // Remove dialog
            bg.destroy();
            dialog.destroy();
            border.destroy();
            title.destroy();
            controlsText.destroy();
            button.destroy();
            buttonText.destroy();
        });
        
        // Close dialog when clicking outside
        bg.on('pointerdown', () => {
            bg.destroy();
            dialog.destroy();
            border.destroy();
            title.destroy();
            controlsText.destroy();
            button.destroy();
            buttonText.destroy();
        });
    }
}