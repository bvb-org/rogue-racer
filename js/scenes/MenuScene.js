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
        this.add.text(width / 2, height / 4 + 60, 'Romanian Racing Adventure', {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Game description
        this.add.text(width / 2, height / 4 + 110, 'Race through Romanian cities, avoid obstacles,\ndefeat enemies, and complete missions in this\naction-packed driving adventure!', {
            font: '16px Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // City selection
        // City selection
        this.createCitySelection(width, height);
        
        // Continue game button (if save exists)
        const savedGame = GameStorage.loadGame();
        if (savedGame) {
            this.createButton(
                width / 2,
                height - 100,
                'Continue Game',
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
                'New Game',
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
                'Start Game',
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
        this.add.text(width / 2, height / 2 - 40, 'Select City:', {
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
                        this.showMessage(`Complete ${cities[index - 1]} first!`);
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
        
        // Start game scene
        this.scene.start('GameScene');
    }
}