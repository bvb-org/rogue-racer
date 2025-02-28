/**
 * Boot Scene
 * Handles initial loading of assets and transitions to the menu
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Display loading text
        const loadingText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'Loading...',
            {
                font: '20px Arial',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);

        // Create loading bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(
            this.cameras.main.width / 2 - 160,
            this.cameras.main.height / 2 + 30,
            320,
            50
        );

        // Update progress bar as assets load
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(
                this.cameras.main.width / 2 - 150,
                this.cameras.main.height / 2 + 40,
                300 * value,
                30
            );
        });

        // Clear progress bar when complete
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

        // Load assets
        this.loadAssets();
    }

    loadAssets() {
        // Load images
        this.load.image('player-car', 'assets/images/player-car.png');
        this.load.image('enemy-car', 'assets/images/enemy-car.png');
        this.load.image('drone', 'assets/images/drone.png');
        this.load.image('bullet', 'assets/images/bullet.png');
        this.load.image('road', 'assets/images/road.png');
        this.load.image('grass', 'assets/images/grass.png');
        this.load.image('building', 'assets/images/building.png');
        this.load.image('mountain', 'assets/images/mountain.png');
        this.load.image('tree', 'assets/images/tree.png');
        this.load.image('billboard', 'assets/images/billboard.png');
        this.load.image('parliament', 'assets/images/parliament.png');
        this.load.image('black-church', 'assets/images/black-church.png');
        this.load.image('button', 'assets/images/button.png');
        
        // Load sounds
        this.load.audio('engine', 'assets/sounds/engine.mp3');
        this.load.audio('crash', 'assets/sounds/crash.mp3');
        this.load.audio('shoot', 'assets/sounds/shoot.mp3');
        this.load.audio('pickup', 'assets/sounds/pickup.mp3');
        this.load.audio('menu-music', 'assets/sounds/menu-music.mp3');
        this.load.audio('game-music', 'assets/sounds/game-music.mp3');
    }

    create() {
        // Create placeholder assets if they don't exist yet
        this.createPlaceholderAssets();
        
        // Transition to menu scene
        this.scene.start('MenuScene');
    }

    createPlaceholderAssets() {
        // This function creates simple placeholder graphics for development
        // These will be replaced with proper assets later
        
        const createPlaceholder = (name, width, height, color) => {
            const graphics = this.make.graphics();
            graphics.fillStyle(color);
            graphics.fillRect(0, 0, width, height);
            graphics.generateTexture(name, width, height);
            graphics.destroy();
        };

        // Create placeholder images
        createPlaceholder('player-car', 40, 70, 0x3498db);
        createPlaceholder('enemy-car', 40, 70, 0xe74c3c);
        createPlaceholder('drone', 30, 30, 0x95a5a6);
        createPlaceholder('bullet', 5, 10, 0xf1c40f);
        createPlaceholder('road', 100, 100, 0x34495e);
        createPlaceholder('grass', 100, 100, 0x2ecc71);
        createPlaceholder('building', 80, 120, 0x7f8c8d);
        createPlaceholder('mountain', 150, 100, 0x795548);
        createPlaceholder('tree', 40, 60, 0x27ae60);
        createPlaceholder('billboard', 100, 50, 0xecf0f1);
        createPlaceholder('parliament', 200, 150, 0xbdc3c7);
        createPlaceholder('black-church', 150, 200, 0x34495e);
        createPlaceholder('button', 200, 50, 0x3498db);
        
        // Create placeholder sounds (empty audio files)
        const createEmptySound = (key) => {
            if (!this.cache.audio.exists(key)) {
                this.cache.audio.add(key, '');
            }
        };
        
        createEmptySound('engine');
        createEmptySound('crash');
        createEmptySound('shoot');
        createEmptySound('pickup');
        createEmptySound('menu-music');
        createEmptySound('game-music');
    }
}