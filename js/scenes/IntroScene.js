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
        
        // Add player car (positioned lower on the screen)
        this.playerCar = this.physics.add.sprite(width / 2, height, 'player-car');
        this.playerCar.setScale(1.5);
        
        // Add enemy car (initially off-screen)
        this.enemyCar = this.physics.add.sprite(width / 2, -150, 'enemy-car');
        this.enemyCar.setScale(1.5);
        
        // Title
        this.add.text(width / 2, 80, 'MISIUNEA TA', {
            font: 'bold 36px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Backstory text with improved visibility (moved higher to avoid overlap with enemy car)
        this.storyText = this.add.text(width / 2, 130, 'Fugi de CG și prietenii săi!\nÎncearcă să îi învingi și să ajungi la CT final.', {
            font: '24px Arial',
            fill: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 5, fill: true }
        }).setOrigin(0.5);
        
        // Dialog boxes (positioned to avoid overlap with cars)
        this.enemyDialog = this.createDialogBox(width / 2, 220, 'Te vom prinde! Nu poți scăpa de noi!', false);
        this.enemyDialog.setVisible(false);
        
        this.playerDialog = this.createDialogBox(width / 2, height - 150, 'Vă voi învinge! Aveți încredere în mine!', true);
        this.playerDialog.setVisible(false);
        
        // Continue button (initially hidden)
        this.continueButton = this.createButton(
            width / 2,
            height - 80,
            'Continuă',
            () => {
                // Disable the button to prevent multiple clicks
                this.continueButton.setVisible(false);
                
                // Start the shooting animation sequence
                this.startShootingSequence();
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
            y: height - 250,
            duration: 1500,
            ease: 'Power1'
        });
        
        // Move enemy car on screen (positioned higher to avoid text overlap)
        timeline.add({
            targets: this.enemyCar,
            y: 300,
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
    
    startShootingSequence() {
        const { width, height } = this.cameras.main;
        
        // No debug text needed
        
        // Create bullets group
        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 10
        });
        
        // Add shoot sound
        this.shootSound = this.sound.add('shoot', {
            loop: false,
            volume: 0.6 // Make it louder
        });
        
        // Create a simple bullet to test if it's visible
        const testBullet = this.add.image(width/2, height/2, 'bullet');
        testBullet.setScale(5); // Make it very large for testing
        testBullet.setTint(0xff0000); // Make it red for visibility
        
        // Delay the shooting sequence to ensure everything is loaded
        this.time.delayedCall(500, () => {
            // First bullet
            this.shootBullet();
            
            // Second bullet after delay
            this.time.delayedCall(400, () => {
                this.shootBullet();
                
                // Third bullet after another delay
                this.time.delayedCall(400, () => {
                    this.shootBullet();
                    
                    // Create explosion after the third bullet
                    this.time.delayedCall(300, () => {
                        
                        // Create a larger explosion
                        this.createExplosion(this.enemyCar.x, this.enemyCar.y);
                        
                        // Flash the screen for dramatic effect
                        this.cameras.main.flash(500, 255, 255, 255);
                        
                        // Destroy the enemy car
                        this.enemyCar.destroy();
                        
                        // Wait longer after the explosion before showing controls
                        this.time.delayedCall(2500, () => {
                            testBullet.destroy();
                            this.showControlsDialog();
                        });
                    });
                });
            });
        });
    }
    
    shootBullet() {
        // Instead of using the physics group, create a direct sprite for better visibility
        const bullet = this.add.sprite(this.playerCar.x, this.playerCar.y - 30, 'bullet');
        bullet.setScale(4); // Make bullet very large and visible
        bullet.setTint(0xff00ff); // Bright magenta color for high visibility
        
        // Create a simple animation to move the bullet upward
        this.tweens.add({
            targets: bullet,
            y: this.enemyCar.y,
            duration: 300, // Twice as fast
            ease: 'Linear'
        });
        
        // Add a glow effect around the bullet
        const glow = this.add.circle(bullet.x, bullet.y, 15, 0xff00ff, 0.5);
        
        // Make the glow follow the bullet
        this.tweens.add({
            targets: glow,
            y: this.enemyCar.y,
            duration: 300, // Twice as fast
            ease: 'Linear'
        });
        
        // Add a trail effect with direct sprites instead of particles
        for (let i = 0; i < 5; i++) {
            const trailPart = this.add.sprite(bullet.x, bullet.y + (i * 10), 'bullet');
            trailPart.setScale(2 - (i * 0.3));
            trailPart.setAlpha(0.7 - (i * 0.1));
            trailPart.setTint(0xff00ff);
            
            // Make trail part follow with delay
            this.tweens.add({
                targets: trailPart,
                y: this.enemyCar.y + (i * 10),
                duration: 300, // Twice as fast
                ease: 'Linear',
                delay: i * 50,
                onComplete: () => {
                    trailPart.destroy();
                }
            });
        }
        
        // Play shoot sound
        this.shootSound.play();
        
        // Auto-destroy bullet and glow after animation completes
        this.time.delayedCall(350, () => { // Adjusted to match faster bullet speed
            bullet.destroy();
            glow.destroy();
        });
    }
    
    createExplosion(x, y) {
        // Create a simpler but more visible explosion using sprites instead of particles
        
        // Create a large central flash
        const flash = this.add.circle(x, y, 40, 0xffffff, 1);
        this.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 2,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                flash.destroy();
            }
        });
        
        // Create explosion pieces using sprites
        const colors = [0xff0000, 0xff7700, 0xffff00, 0xff00ff];
        
        // Create 20 explosion pieces
        for (let i = 0; i < 20; i++) {
            // Random angle and distance
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 100;
            
            // Calculate end position
            const endX = x + Math.cos(angle) * distance;
            const endY = y + Math.sin(angle) * distance;
            
            // Create piece
            const piece = this.add.sprite(x, y, 'bullet');
            piece.setScale(3 + Math.random() * 2);
            piece.setTint(colors[Math.floor(Math.random() * colors.length)]);
            
            // Animate piece
            this.tweens.add({
                targets: piece,
                x: endX,
                y: endY,
                alpha: 0,
                scale: 0,
                duration: 800 + Math.random() * 400,
                ease: 'Power2',
                onComplete: () => {
                    piece.destroy();
                }
            });
        }
        
        // Create a shockwave ring
        const shockwave = this.add.circle(x, y, 10, 0xffffff, 0.8);
        shockwave.setStrokeStyle(4, 0xffff00);
        
        this.tweens.add({
            targets: shockwave,
            radius: 150,
            alpha: 0,
            duration: 800,
            ease: 'Cubic.Out',
            onComplete: () => {
                shockwave.destroy();
            }
        });
        
        // Create a second, delayed shockwave
        const secondShockwave = this.add.circle(x, y, 5, 0xff0000, 0.6);
        secondShockwave.setStrokeStyle(3, 0xff7700);
        
        this.tweens.add({
            targets: secondShockwave,
            radius: 100,
            alpha: 0,
            delay: 200,
            duration: 600,
            ease: 'Cubic.Out',
            onComplete: () => {
                secondShockwave.destroy();
            }
        });
        
        // Play crash sound if available
        if (this.sound.get('crash')) {
            this.sound.play('crash', { volume: 0.8 });
        }
    }
    
    showControlsDialog() {
        const { width, height } = this.cameras.main;
        
        // Create a semi-transparent background
        const bg = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7)
            .setInteractive()
            .setDepth(200);
        
        // Create controls dialog
        const dialogWidth = 400;
        const dialogHeight = 350; // Made taller to accommodate the shockwave note
        const dialog = this.add.rectangle(width/2, height/2, dialogWidth, dialogHeight, 0x333333)
            .setDepth(201);
            
        // Add dialog border
        const border = this.add.rectangle(width/2, height/2, dialogWidth, dialogHeight)
            .setStrokeStyle(2, 0xffffff)
            .setDepth(202);
        
        // Add title
        const title = this.add.text(width/2, height/2 - 140, 'CONTROALE', {
            font: 'bold 24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5).setDepth(202);
        
        // Add controls text
        const controlsText = this.add.text(width/2, height/2 - 70,
            '↑  Accelerează\n↓  Frânează/Marșarier\n←  Virează Stânga\n→  Virează Dreapta\nSPACE - Trage', {
            font: '18px Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setDepth(202);
        
        // Add shockwave text with note that it's locked
        const shockwaveText = this.add.text(width/2, height/2 + 30,
            'C - Undă de șoc\n(Deblocat după primul nivel)', {
            font: '18px Arial',
            fill: '#888888', // Gray color to indicate it's locked
            align: 'center'
        }).setOrigin(0.5).setDepth(202);
        
        // Add OK button
        const buttonWidth = 100;
        const buttonHeight = 40;
        const button = this.add.rectangle(width/2, height/2 + 100, buttonWidth, buttonHeight, 0x3498db)
            .setInteractive()
            .setDepth(202);
            
        const buttonText = this.add.text(width/2, height/2 + 100, 'OK', {
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
        
        // Close dialog and start game when OK is clicked
        button.on('pointerup', () => {
            // Remove dialog
            bg.destroy();
            dialog.destroy();
            border.destroy();
            title.destroy();
            controlsText.destroy();
            shockwaveText.destroy();
            button.destroy();
            buttonText.destroy();
            
            // Stop intro music if playing
            if (this.introMusic) {
                this.introMusic.stop();
            }
            
            // Start the game
            this.scene.start('GameScene');
        });
    }
}