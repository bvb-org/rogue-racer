/**
 * Outro Scene
 * Displays the ending sequence after defeating the final boss
 */
class OutroScene extends Phaser.Scene {
    constructor() {
        super({ key: 'OutroScene' });
    }

    create() {
        // Get screen dimensions
        const { width, height } = this.cameras.main;
        
        // Background
        this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);
        
        // Create a straight road for the intro
        this.createRoad(width, height);
        
        // Add player car (positioned lower on the screen)
        this.playerCar = this.physics.add.sprite(width / 2, height - 150, 'player-car');
        this.playerCar.setScale(1.5);
        
        // Add enemy car (initially off-screen)
        this.enemyCar = this.physics.add.sprite(width / 2, 300, 'enemy-car');
        this.enemyCar.setScale(1.5);
        this.enemyCar.setTint(0xaaaaaa); // Make it look damaged
        
        // Dialog boxes
        this.playerDialog = this.createDialogBox(width / 2, height - 250, 'After all these years, I finally came to defeat you', true);
        this.playerDialog.setVisible(false);
        
        this.enemyDialog = this.createDialogBox(width / 2, 220, 'You cannot do this to me, we have to win together', false);
        this.enemyDialog.setVisible(false);
        
        // Create explosion effects group
        this.explosions = this.add.group();
        
        // Play outro music if available
        if (this.sound.get('menu-music')) {
            this.outroMusic = this.sound.add('menu-music', { loop: true, volume: 0.5 });
            this.outroMusic.play();
        }
        
        // Start the outro sequence
        this.startOutroSequence();
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
    
    createBeach(width, height) {
        // Clear existing road and scenery
        this.children.each(child => {
            if (child.type === 'Rectangle' || child.type === 'Image') {
                if (child !== this.playerCar && child !== this.enemyCar) {
                    child.destroy();
                }
            }
        });
        
        // Create a beach background
        this.add.rectangle(0, 0, width, height, 0x87CEEB).setOrigin(0); // Sky blue background
        
        // Create sand
        this.add.rectangle(0, height / 2, width, height / 2, 0xF5DEB3).setOrigin(0); // Wheat color for sand
        
        // Create water
        this.add.rectangle(0, height * 0.7, width, height * 0.3, 0x1E90FF).setOrigin(0); // Dodger blue for water
        
        // Add some waves
        for (let x = 0; x < width; x += 100) {
            const waveY = height * 0.7;
            const wave = this.add.rectangle(x, waveY, 80, 5, 0xADD8E6).setOrigin(0); // Light blue for waves
            
            // Animate the wave
            this.tweens.add({
                targets: wave,
                y: waveY - 5,
                duration: 1000 + Math.random() * 500,
                yoyo: true,
                repeat: -1
            });
        }
        
        // Add a sun
        const sun = this.add.circle(width * 0.8, height * 0.2, 40, 0xFFD700); // Gold color for sun
        
        // Add some palm trees
        for (let i = 0; i < 3; i++) {
            const x = 100 + i * 200;
            const y = height * 0.65;
            
            // Tree trunk
            this.add.rectangle(x, y, 10, 60, 0x8B4513).setOrigin(0.5, 1); // SaddleBrown for trunk
            
            // Tree leaves
            const leaves = this.add.circle(x, y - 60, 30, 0x228B22); // ForestGreen for leaves
            leaves.setScale(1.5, 1);
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
    
    startOutroSequence() {
        const { width, height } = this.cameras.main;
        
        // Timeline for the outro sequence
        const timeline = this.tweens.createTimeline();
        
        // Initial screen shake (earthquake effect from boss defeat)
        this.cameras.main.shake(2000, 0.02);
        
        // Wait for shake to finish
        timeline.add({
            targets: {},
            duration: 2000,
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
                // Hide player dialog
                this.tweens.add({
                    targets: this.playerDialog,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        this.playerDialog.setVisible(false);
                        
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
            }
        });
        
        // Wait for enemy dialog
        timeline.add({
            targets: {},
            duration: 3000,
            onComplete: () => {
                // Hide enemy dialog
                this.tweens.add({
                    targets: this.enemyDialog,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        this.enemyDialog.setVisible(false);
                        
                        // Update player dialog
                        this.updateDialogText(this.playerDialog, 'Do you want to resign?');
                        this.playerDialog.setVisible(true);
                        this.playerDialog.setAlpha(0);
                        this.tweens.add({
                            targets: this.playerDialog,
                            alpha: 1,
                            duration: 500
                        });
                    }
                });
            }
        });
        
        // Wait for player dialog
        timeline.add({
            targets: {},
            duration: 3000,
            onComplete: () => {
                // Hide player dialog
                this.tweens.add({
                    targets: this.playerDialog,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        this.playerDialog.setVisible(false);
                        
                        // Update enemy dialog
                        this.updateDialogText(this.enemyDialog, 'Charge!');
                        this.enemyDialog.setVisible(true);
                        this.enemyDialog.setAlpha(0);
                        this.tweens.add({
                            targets: this.enemyDialog,
                            alpha: 1,
                            duration: 500
                        });
                        
                        // Move enemy car towards player
                        this.tweens.add({
                            targets: this.enemyCar,
                            y: height - 250,
                            duration: 1500,
                            ease: 'Power1'
                        });
                    }
                });
            }
        });
        
        // Wait for enemy dialog and movement
        timeline.add({
            targets: {},
            duration: 2000,
            onComplete: () => {
                // Hide enemy dialog
                this.tweens.add({
                    targets: this.enemyDialog,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        this.enemyDialog.setVisible(false);
                        
                        // Update player dialog
                        this.updateDialogText(this.playerDialog, 'Okay, if this is what you want, let it be');
                        this.playerDialog.setVisible(true);
                        this.playerDialog.setAlpha(0);
                        this.tweens.add({
                            targets: this.playerDialog,
                            alpha: 1,
                            duration: 500
                        });
                    }
                });
            }
        });
        
        // Wait for player dialog
        timeline.add({
            targets: {},
            duration: 3000,
            onComplete: () => {
                // Hide player dialog
                this.tweens.add({
                    targets: this.playerDialog,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        this.playerDialog.setVisible(false);
                        
                        // Start epic battle sequence
                        this.startEpicBattleSequence();
                    }
                });
            }
        });
        
        // Start the timeline
        timeline.play();
    }
    
    updateDialogText(dialogBox, newText) {
        // Find the text object in the dialog container
        const textObj = dialogBox.list.find(item => item.type === 'Text');
        if (textObj) {
            textObj.setText(newText);
        }
    }
    
    startEpicBattleSequence() {
        const { width, height } = this.cameras.main;
        
        // Create bullets group
        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 50
        });
        
        // Add shoot sound
        this.shootSound = this.sound.add('shoot', {
            loop: false,
            volume: 0.6
        });
        
        // Create a rapid fire sequence
        for (let i = 0; i < 20; i++) {
            this.time.delayedCall(i * 100, () => {
                this.shootBullet();
            });
        }
        
        // Add rockets after bullets
        this.time.delayedCall(2500, () => {
            // Create rockets
            for (let i = 0; i < 5; i++) {
                this.time.delayedCall(i * 300, () => {
                    this.shootRocket();
                });
            }
            
            // Add lasers after rockets
            this.time.delayedCall(2000, () => {
                this.shootLaser();
                
                // Final explosion sequence
                this.time.delayedCall(1500, () => {
                    this.createMassiveExplosion();
                    
                    // Transition to beach scene
                    this.time.delayedCall(3000, () => {
                        this.transitionToBeach();
                    });
                });
            });
        });
    }
    
    shootBullet() {
        const bullet = this.add.sprite(this.playerCar.x, this.playerCar.y - 30, 'bullet');
        bullet.setScale(4);
        bullet.setTint(0xff00ff);
        
        // Create a simple animation to move the bullet upward
        this.tweens.add({
            targets: bullet,
            y: this.enemyCar.y,
            duration: 300,
            ease: 'Linear',
            onComplete: () => {
                // Create small explosion at impact
                this.createSmallExplosion(bullet.x, this.enemyCar.y);
                bullet.destroy();
            }
        });
        
        // Add a glow effect around the bullet
        const glow = this.add.circle(bullet.x, bullet.y, 15, 0xff00ff, 0.5);
        
        // Make the glow follow the bullet
        this.tweens.add({
            targets: glow,
            y: this.enemyCar.y,
            duration: 300,
            ease: 'Linear',
            onComplete: () => {
                glow.destroy();
            }
        });
        
        // Play shoot sound
        this.shootSound.play();
    }
    
    shootRocket() {
        // Create rocket sprite
        const rocket = this.add.sprite(this.playerCar.x, this.playerCar.y - 30, 'rocket');
        rocket.setScale(2);
        
        // Create rocket trail
        const particles = this.add.particles(rocket.x, rocket.y + 20, 'bullet', {
            speed: { min: 50, max: 100 },
            scale: { start: 2, end: 0 },
            lifespan: 300,
            blendMode: 'ADD',
            tint: [0xff8800, 0xff4400],
            emitting: true
        });
        
        // Move rocket towards enemy
        this.tweens.add({
            targets: rocket,
            y: this.enemyCar.y,
            duration: 600,
            ease: 'Cubic.In',
            onUpdate: () => {
                // Update particle emitter position
                particles.setPosition(rocket.x, rocket.y + 20);
            },
            onComplete: () => {
                // Create medium explosion at impact
                this.createMediumExplosion(rocket.x, this.enemyCar.y);
                rocket.destroy();
                particles.destroy();
            }
        });
        
        // Play shoot sound
        this.shootSound.play();
    }
    
    shootLaser() {
        // Create laser beam
        const laser = this.add.rectangle(this.playerCar.x, this.playerCar.y - 200, 20, 400, 0x00ffff);
        laser.setAlpha(0);
        
        // Flash the screen
        this.cameras.main.flash(500, 0, 255, 255);
        
        // Animate laser beam
        this.tweens.add({
            targets: laser,
            alpha: 0.8,
            width: 40,
            duration: 300,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                laser.destroy();
                
                // Create large explosion at enemy
                this.createLargeExplosion(this.enemyCar.x, this.enemyCar.y);
            }
        });
        
        // Add glow effect
        const glow = this.add.rectangle(this.playerCar.x, this.playerCar.y - 200, 30, 400, 0x00ffff, 0.3);
        glow.setAlpha(0);
        
        this.tweens.add({
            targets: glow,
            alpha: 0.5,
            width: 60,
            duration: 300,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                glow.destroy();
            }
        });
        
        // Play shoot sound
        this.shootSound.play();
    }
    
    createSmallExplosion(x, y) {
        // Create a simple explosion
        const flash = this.add.circle(x, y, 20, 0xffffff, 1);
        
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
        
        // Create explosion pieces
        const colors = [0xff0000, 0xff7700, 0xffff00];
        
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 20 + Math.random() * 30;
            
            const endX = x + Math.cos(angle) * distance;
            const endY = y + Math.sin(angle) * distance;
            
            const piece = this.add.sprite(x, y, 'bullet');
            piece.setScale(2 + Math.random() * 1);
            piece.setTint(colors[Math.floor(Math.random() * colors.length)]);
            
            this.tweens.add({
                targets: piece,
                x: endX,
                y: endY,
                alpha: 0,
                scale: 0,
                duration: 500 + Math.random() * 200,
                ease: 'Power2',
                onComplete: () => {
                    piece.destroy();
                }
            });
        }
        
        // Play crash sound if available
        if (this.sound.get('crash')) {
            this.sound.play('crash', { volume: 0.3 });
        }
    }
    
    createMediumExplosion(x, y) {
        // Create a larger explosion
        const flash = this.add.circle(x, y, 40, 0xffffff, 1);
        
        this.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 3,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
                flash.destroy();
            }
        });
        
        // Create explosion pieces
        const colors = [0xff0000, 0xff7700, 0xffff00, 0xff00ff];
        
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 40 + Math.random() * 60;
            
            const endX = x + Math.cos(angle) * distance;
            const endY = y + Math.sin(angle) * distance;
            
            const piece = this.add.sprite(x, y, 'bullet');
            piece.setScale(3 + Math.random() * 2);
            piece.setTint(colors[Math.floor(Math.random() * colors.length)]);
            
            this.tweens.add({
                targets: piece,
                x: endX,
                y: endY,
                alpha: 0,
                scale: 0,
                duration: 600 + Math.random() * 300,
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
            radius: 100,
            alpha: 0,
            duration: 600,
            ease: 'Cubic.Out',
            onComplete: () => {
                shockwave.destroy();
            }
        });
        
        // Play crash sound if available
        if (this.sound.get('crash')) {
            this.sound.play('crash', { volume: 0.6 });
        }
    }
    
    createLargeExplosion(x, y) {
        // Create a large explosion
        const flash = this.add.circle(x, y, 60, 0xffffff, 1);
        
        this.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 4,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                flash.destroy();
            }
        });
        
        // Create explosion pieces
        const colors = [0xff0000, 0xff7700, 0xffff00, 0xff00ff, 0x00ffff];
        
        for (let i = 0; i < 25; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 60 + Math.random() * 100;
            
            const endX = x + Math.cos(angle) * distance;
            const endY = y + Math.sin(angle) * distance;
            
            const piece = this.add.sprite(x, y, 'bullet');
            piece.setScale(4 + Math.random() * 3);
            piece.setTint(colors[Math.floor(Math.random() * colors.length)]);
            
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
        
        // Create multiple shockwave rings
        for (let i = 0; i < 3; i++) {
            const delay = i * 200;
            const shockwave = this.add.circle(x, y, 10, 0xffffff, 0.8 - (i * 0.2));
            shockwave.setStrokeStyle(4, colors[i % colors.length]);
            
            this.tweens.add({
                targets: shockwave,
                radius: 150 + (i * 50),
                alpha: 0,
                delay: delay,
                duration: 800,
                ease: 'Cubic.Out',
                onComplete: () => {
                    shockwave.destroy();
                }
            });
        }
        
        // Shake the camera
        this.cameras.main.shake(500, 0.02);
        
        // Play crash sound if available
        if (this.sound.get('crash')) {
            this.sound.play('crash', { volume: 0.8 });
        }
    }
    
    createMassiveExplosion() {
        const { width, height } = this.cameras.main;
        
        // Flash the screen
        this.cameras.main.flash(1000, 255, 255, 255);
        
        // Shake the camera violently
        this.cameras.main.shake(2000, 0.05);
        
        // Create a massive central explosion
        const flash = this.add.circle(this.enemyCar.x, this.enemyCar.y, 100, 0xffffff, 1);
        
        this.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 5,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                flash.destroy();
            }
        });
        
        // Create explosion pieces all over the screen
        const colors = [0xff0000, 0xff7700, 0xffff00, 0xff00ff, 0x00ffff, 0xffffff];
        
        for (let i = 0; i < 50; i++) {
            const startX = this.enemyCar.x + (Math.random() * 200 - 100);
            const startY = this.enemyCar.y + (Math.random() * 200 - 100);
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 300;
            
            const endX = startX + Math.cos(angle) * distance;
            const endY = startY + Math.sin(angle) * distance;
            
            const piece = this.add.sprite(startX, startY, 'bullet');
            piece.setScale(5 + Math.random() * 5);
            piece.setTint(colors[Math.floor(Math.random() * colors.length)]);
            
            this.tweens.add({
                targets: piece,
                x: endX,
                y: endY,
                alpha: 0,
                scale: 0,
                duration: 1000 + Math.random() * 1000,
                ease: 'Power2',
                onComplete: () => {
                    piece.destroy();
                }
            });
        }
        
        // Create multiple expanding shockwaves
        for (let i = 0; i < 5; i++) {
            const delay = i * 300;
            const shockwave = this.add.circle(this.enemyCar.x, this.enemyCar.y, 20, 0xffffff, 0.8 - (i * 0.15));
            shockwave.setStrokeStyle(6, colors[i % colors.length]);
            
            this.tweens.add({
                targets: shockwave,
                radius: 300 + (i * 100),
                alpha: 0,
                delay: delay,
                duration: 1500,
                ease: 'Cubic.Out',
                onComplete: () => {
                    shockwave.destroy();
                }
            });
        }
        
        // Destroy the enemy car
        this.tweens.add({
            targets: this.enemyCar,
            alpha: 0,
            scale: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.enemyCar.destroy();
            }
        });
        
        // Play crash sound if available
        if (this.sound.get('crash')) {
            this.sound.play('crash', { volume: 1.0 });
        }
    }
    
    transitionToBeach() {
        const { width, height } = this.cameras.main;
        
        // Fade out
        this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
            if (progress === 1) {
                // Create beach scene
                this.createBeach(width, height);
                
                // Position player car on the beach
                this.playerCar.setPosition(width * 0.2, height * 0.65);
                
                // Fade back in
                this.cameras.main.fadeIn(1000);
                
                // Move player car towards sunset
                this.tweens.add({
                    targets: this.playerCar,
                    x: width * 0.8,
                    duration: 8000,
                    ease: 'Linear',
                    onComplete: () => {
                        // Show final message
                        this.playerDialog = this.createDialogBox(width / 2, height / 2 - 100, 'dupa ce scapam de cg ne vedem in vama', true);
                        this.playerDialog.setAlpha(0);
                        
                        this.tweens.add({
                            targets: this.playerDialog,
                            alpha: 1,
                            duration: 500
                        });
                        
                        // Wait for final message
                        this.time.delayedCall(4000, () => {
                            // Fade out
                            this.cameras.main.fade(2000, 0, 0, 0, false, (camera, progress) => {
                                if (progress === 1) {
                                    // Stop music
                                    if (this.outroMusic) {
                                        this.outroMusic.stop();
                                    }
                                    
                                    // Return to menu
                                    this.scene.start('MenuScene');
                                }
                            });
                        });
                    }
                });
            }
        });
    }
}