/**
 * Intro Scene
 * Displays the backstory before starting the first level
 */
class IntroScene extends Phaser.Scene {
    constructor() {
        super({ key: 'IntroScene' });
    }

    create() {
        // Get screen dimensions
        const { width, height } = this.cameras.main;
        
        // Background
        this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);
        
        // Create a straight road for the intro
        this.createRoad(width, height);
        
        // Add player car
        this.playerCar = this.physics.add.sprite(width / 2, height - 150, 'player-car');
        this.playerCar.setScale(1.5);
        
        // Add enemy car (initially off-screen)
        this.enemyCar = this.physics.add.sprite(width / 2, -150, 'enemy-car');
        this.enemyCar.setScale(1.5);
        
        // Title
        this.add.text(width / 2, 80, 'MISIUNEA TA', {
            font: 'bold 36px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Backstory text
        this.storyText = this.add.text(width / 2, 150, 'Fugi de CG și POT!\nÎncearcă să îi învingi și să ajungi la CT final.', {
            font: '24px Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Dialog boxes
        this.enemyDialog = this.createDialogBox(width / 2, 200, 'Te vom prinde! Nu poți scăpa de noi!', false);
        this.enemyDialog.setVisible(false);
        
        this.playerDialog = this.createDialogBox(width / 2, height - 250, 'Vă voi învinge! Aveți încredere în mine!', true);
        this.playerDialog.setVisible(false);
        
        // Continue button (initially hidden)
        this.continueButton = this.createButton(
            width / 2,
            height - 80,
            'Continuă',
            () => {
                // Stop intro music if playing
                if (this.introMusic) {
                    this.introMusic.stop();
                }
                
                // Start the game
                this.scene.start('GameScene');
            }
        );
        this.continueButton.setVisible(false);
        
        // Play intro music if available
        if (this.sound.get('intro-music')) {
            this.introMusic = this.sound.add('intro-music', { loop: true, volume: 0.5 });
            this.introMusic.play();
        } else {
            // Fallback to menu music if intro music isn't available
            this.introMusic = this.sound.add('menu-music', { loop: true, volume: 0.5 });
            this.introMusic.play();
        }
        
        // Start the intro sequence
        this.startIntroSequence();
    }
    
    createRoad(width, height) {
        // Create a simple straight road
        const roadWidth = 200;
        const roadX = (width - roadWidth) / 2;
        
        // Road background
        this.add.rectangle(roadX, 0, roadWidth, height, 0x333333).setOrigin(0);
        
        // Road markings
        for (let y = -100; y < height + 100; y += 50) {
            this.add.rectangle(width / 2, y, 10, 30, 0xffffff).setOrigin(0.5);
        }
        
        // Add some simple scenery
        for (let i = 0; i < 5; i++) {
            // Left side trees
            this.add.image(roadX - 50, i * 200, 'tree').setScale(0.8);
            
            // Right side trees
            this.add.image(roadX + roadWidth + 50, i * 200 + 100, 'tree').setScale(0.8);
        }
    }
    
    createDialogBox(x, y, text, isPlayer) {
        const padding = 20;
        const maxWidth = 400;
        
        // Create text object to measure its width
        const textObj = this.add.text(0, 0, text, {
            font: '18px Arial',
            fill: '#000000',
            wordWrap: { width: maxWidth - (padding * 2) }
        });
        
        // Get text dimensions
        const textWidth = Math.min(textObj.width + padding * 2, maxWidth);
        const textHeight = textObj.height + padding * 2;
        
        // Create dialog container
        const container = this.add.container(x, y);
        
        // Create dialog background
        const background = this.add.graphics();
        background.fillStyle(isPlayer ? 0x3498db : 0xe74c3c, 1);
        background.fillRoundedRect(-textWidth / 2, -textHeight / 2, textWidth, textHeight, 10);
        
        // Add pointer triangle
        const pointerGraphics = this.add.graphics();
        pointerGraphics.fillStyle(isPlayer ? 0x3498db : 0xe74c3c, 1);
        
        if (isPlayer) {
            // Pointer at the bottom for player
            pointerGraphics.fillTriangle(
                0, textHeight / 2,
                -10, textHeight / 2 + 20,
                10, textHeight / 2 + 20
            );
        } else {
            // Pointer at the top for enemy
            pointerGraphics.fillTriangle(
                0, -textHeight / 2,
                -10, -textHeight / 2 - 20,
                10, -textHeight / 2 - 20
            );
        }
        
        // Position the text in the dialog
        textObj.setPosition(-textWidth / 2 + padding, -textHeight / 2 + padding);
        
        // Add elements to container
        container.add([background, pointerGraphics, textObj]);
        
        return container;
    }
    
    createButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 200, 50, 0x3498db, 1).setInteractive();
        const buttonText = this.add.text(x, y, text, {
            font: '18px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        button.on('pointerover', () => {
            button.setFillStyle(0x2980b9);
        });
        
        button.on('pointerout', () => {
            button.setFillStyle(0x3498db);
        });
        
        button.on('pointerdown', () => {
            button.setFillStyle(0x1c6ea4);
        });
        
        button.on('pointerup', () => {
            button.setFillStyle(0x2980b9);
            callback();
        });
        
        // Create a container for the button and text
        const container = this.add.container(0, 0, [button, buttonText]);
        
        return container;
    }
    
    startIntroSequence() {
        const { width, height } = this.cameras.main;
        
        // Timeline for the intro sequence
        const timeline = this.tweens.createTimeline();
        
        // Move player car up a bit
        timeline.add({
            targets: this.playerCar,
            y: height - 200,
            duration: 1500,
            ease: 'Power1'
        });
        
        // Move enemy car on screen
        timeline.add({
            targets: this.enemyCar,
            y: 150,
            duration: 2000,
            ease: 'Power1',
            onComplete: () => {
                // Show enemy dialog
                this.enemyDialog.setVisible(true);
                this.enemyDialog.setAlpha(0);
                this.tweens.add({
                    targets: this.enemyDialog,
                    alpha: 1,
                    duration: 500
                });
            }
        });
        
        // Wait for enemy dialog
        timeline.add({
            targets: {},
            duration: 3000,
            onComplete: () => {
                // Show player dialog
                this.playerDialog.setVisible(true);
                this.playerDialog.setAlpha(0);
                this.tweens.add({
                    targets: this.playerDialog,
                    alpha: 1,
                    duration: 500
                });
            }
        });
        
        // Wait for player dialog
        timeline.add({
            targets: {},
            duration: 3000,
            onComplete: () => {
                // Show continue button
                this.continueButton.setVisible(true);
                this.continueButton.setAlpha(0);
                this.tweens.add({
                    targets: this.continueButton,
                    alpha: 1,
                    duration: 500
                });
            }
        });
        
        // Start the timeline
        timeline.play();
    }
}