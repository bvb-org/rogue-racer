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
    },
    availableUpgradePoints: 2 // Initial upgrade points
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
    
    // Fix for AudioContext issue
    // We need to resume the AudioContext after user interaction
    function resumeAudio() {
        if (game.sound && game.sound.context) {
            // Resume the AudioContext
            game.sound.context.resume().then(() => {
                console.log('AudioContext resumed successfully');
            }).catch(error => {
                console.error('Error resuming AudioContext:', error);
            });
        }
        
        // Remove the event listeners once audio is resumed
        document.body.removeEventListener('click', resumeAudio);
        document.body.removeEventListener('touchstart', resumeAudio);
        document.body.removeEventListener('keydown', resumeAudio);
    }
    
    // Add event listeners for user interaction
    document.body.addEventListener('click', resumeAudio);
    document.body.addEventListener('touchstart', resumeAudio);
    document.body.addEventListener('keydown', resumeAudio);
};