// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
        BootScene,
        MenuScene,
        GameScene,
        UpgradeScene
    ]
};

// Game state
const gameState = {
    currentCity: 'Bucharest', // Starting city
    cities: ['Bucharest', 'Brașov', 'Cluj-Napoca'],
    playerStats: {
        speed: 1,
        fireRate: 1,
        ammo: 50,
        health: 100
    },
    missions: {
        Bucharest: { completed: false },
        'Brașov': { completed: false },
        'Cluj-Napoca': { completed: false }
    },
    upgrades: {
        speed: 0,
        fireRate: 0,
        ammo: 0,
        health: 0
    }
};

// Initialize the game when the window loads
window.onload = function() {
    // Hide loading text
    document.getElementById('loading').style.display = 'none';
    
    // Create the game
    const game = new Phaser.Game(config);
    
    // Make game state accessible globally
    game.gameState = gameState;
    
    // Load saved game if available
    const savedGame = GameStorage.loadGame();
    if (savedGame) {
        Object.assign(game.gameState, savedGame);
    }
};