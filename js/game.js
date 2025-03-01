// Flag to enable direct access to boss level for testing
const ENABLE_BOSS_TEST = true;

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        BootScene,
        MenuScene,
        IntroScene,
        GameScene,
        UpgradeScene,
        BossScene
    ]
};

// Game state
const gameState = {
    currentCity: 'Bucharest', // Starting city
    cities: ['Bucharest', 'Brașov', 'Cluj-Napoca', 'Timisoara', 'Iasi', 'Vaslui'],
    playerStats: {
        speed: 1,
        fireRate: 1,
        ammo: 25,
        health: 50
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
    },
    availableUpgradePoints: 2, // Initial upgrade points
    bossDefeated: false // Track if boss has been defeated
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
        
        // Ensure all cities have corresponding mission entries
        game.gameState.cities.forEach(city => {
            if (!game.gameState.missions[city]) {
                game.gameState.missions[city] = { completed: false };
                console.log(`Added missing mission entry for ${city}`);
            }
        });
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        // The Scale Manager will handle resizing the canvas
        // but we can add additional logic here if needed
        console.log('Window resized to: ' + window.innerWidth + 'x' + window.innerHeight);
    });
    
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