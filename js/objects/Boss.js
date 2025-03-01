/**
 * Boss
 * Handles the final boss enemy with special abilities
 */
class Boss extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy-car');
        
        // Override enemy properties for boss
        this.sprite.setScale(4.0); // Make boss much bigger (4x instead of 2x)
        this.speed = 60; // Slower than regular enemies
        this.health = 300; // Much more health (increased from 50 to 300)
        this.maxHealth = 500;
        this.damage = 40; // More damage on collision
        this.scoreValue = 10000; // Big score reward
        this.active = true;
        this.lastProjectileTime = 0;
        this.projectileCooldown = 2000; // ms between projectile shots (simple, consistent timing)
        this.dialogueCooldown = 8000; // ms between dialogue messages
        this.lastDialogueTime = 0;
        this.healthThresholds = [0.8, 0.6, 0.4, 0.2]; // Trigger dialogue at these health percentages
        this.triggeredThresholds = [];
        
        // Set boss tint to make it visually distinct
        this.sprite.setTint(0xff0000);
        
        // Create health bar for boss
        this.createHealthBar();
        
        // Boss dialogue options
        this.dialogues = [
            "Așa deci, tu ești cel care încearcă să salveze România?",
            "Nu poți opri planul meu de a prelua controlul!",
            "Mașina mea este superioară! Nu ai nicio șansă!",
            "Crezi că poți învinge Marele Boss?",
            "România va fi a mea!",
            "Traficul din București va părea o joacă după ce termin cu tine!",
            "Ai curaj, dar îți lipsește puterea!",
            "Încearcă să mă oprești dacă poți!",
            "Asta e tot ce poți face? Dezamăgitor!",
            "Voi transforma toate drumurile în gropi!"
        ];
        
        // Dialogue for specific health thresholds
        this.thresholdDialogues = {
            0.8: "Abia m-ai zgâriat! Acum să vezi ce pot eu!",
            0.6: "Începi să mă enervezi! Ia asta!",
            0.4: "Imposibil! Nimeni nu m-a rănit așa până acum!",
            0.2: "Nu! Nu voi fi învins! NICIODATĂ!"
        };
    }
    
    update(time) {
        if (!this.active) return;
        
        super.update();
        
        // Update health bar position to follow boss
        this.updateHealthBar();
        
        // Fire projectiles periodically
        if (time > this.lastProjectileTime + this.projectileCooldown) {
            this.fireProjectiles(time);
            this.lastProjectileTime = time;
        }
        
        // Random dialogue
        if (time > this.lastDialogueTime + this.dialogueCooldown) {
            this.speakRandomDialogue();
            this.lastDialogueTime = time;
        }
        
        // Check health thresholds for special dialogue
        const healthPercent = this.health / this.maxHealth;
        this.healthThresholds.forEach(threshold => {
            if (healthPercent <= threshold && !this.triggeredThresholds.includes(threshold)) {
                this.triggeredThresholds.push(threshold);
                this.speakThresholdDialogue(threshold);
            }
        });
    }
    
    fireProjectiles(time) {
        // Only fire if player is active
        if (this.scene.player && this.scene.player.sprite.active) {
            // Calculate angle to player for accurate targeting
            const dx = this.scene.player.sprite.x - this.sprite.x;
            const dy = this.scene.player.sprite.y - this.sprite.y;
            const angleToPlayer = Math.atan2(dy, dx);
            
            // Fire a single projectile directly at the player
            this.fireProjectileInDirection(angleToPlayer);
        }
    }
    
    fireProjectileInDirection(angle) {
        // Create projectile with offset from boss center
        const offsetDistance = 80; // Offset from boss center
        const offsetX = Math.cos(angle) * offsetDistance;
        const offsetY = Math.sin(angle) * offsetDistance;
        
        // Get position for the projectile
        const projectileX = this.sprite.x + offsetX;
        const projectileY = this.sprite.y + offsetY;
        
        // Create the projectile
        const projectile = this.scene.physics.add.sprite(
            projectileX,
            projectileY,
            'bullet'
        );
        
        // Set projectile properties
        projectile.setTint(0xffff00); // Yellow color
        projectile.setScale(2.0); // Make it visible but not too big
        projectile.setDepth(5);
        projectile.isBossProjectile = true;
        
        // Set velocity based on angle
        const speed = 300; // Slightly slower than player bullets for better visibility
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        projectile.setVelocity(vx, vy);
        
        // Add to physics group for collision detection
        this.scene.bossProjectiles.add(projectile);
        
        // Set lifespan
        projectile.lifespan = 2000; // 2 seconds lifespan
        
        // Add a simple glow effect
        projectile.setBlendMode(Phaser.BlendModes.ADD);
    }
    
    speakRandomDialogue() {
        // Pick a random dialogue line
        const randomIndex = Phaser.Math.Between(0, this.dialogues.length - 1);
        const dialogue = this.dialogues[randomIndex];
        
        // Display the dialogue
        this.showDialogue(dialogue);
    }
    
    speakThresholdDialogue(threshold) {
        // Get dialogue for this threshold
        const dialogue = this.thresholdDialogues[threshold];
        
        // Display the dialogue with emphasis
        this.showDialogue(dialogue, true);
    }
    
    showDialogue(text, isImportant = false) {
        // Create dialogue text above boss
        const dialogue = this.scene.add.text(
            this.sprite.x,
            this.sprite.y - 100,
            text,
            {
                font: isImportant ? 'bold 18px Arial' : '16px Arial',
                fill: isImportant ? '#ff0000' : '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                backgroundColor: isImportant ? '#000000' : null,
                padding: isImportant ? { x: 10, y: 5 } : null
            }
        ).setOrigin(0.5).setDepth(100);
        
        // Add fade out animation
        this.scene.tweens.add({
            targets: dialogue,
            y: dialogue.y - 50,
            alpha: { from: 1, to: 0 },
            duration: isImportant ? 4000 : 3000,
            onComplete: () => {
                dialogue.destroy();
            }
        });
    }
    
    createHealthBar() {
        // Create health bar background
        this.healthBarBg = this.scene.add.rectangle(
            this.sprite.x,
            this.sprite.y - 100, // Position higher above the larger boss
            200, // Wider health bar (was 100)
            20, // Taller health bar (was 10)
            0x000000,
            0.8
        ).setDepth(15);
        
        // Create health bar
        this.healthBar = this.scene.add.rectangle(
            this.sprite.x - 100, // Adjusted for wider bar
            this.sprite.y - 100, // Position higher above the larger boss
            200, // Wider health bar (was 100)
            20, // Taller health bar (was 10)
            0xff0000,
            1
        ).setOrigin(0, 0.5).setDepth(16);
        
        // Add health text
        this.healthText = this.scene.add.text(
            this.sprite.x,
            this.sprite.y - 100,
            'BOSS',
            {
                font: 'bold 14px Arial',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setDepth(17);
    }
    
    updateHealthBar() {
        // Update health bar position
        this.healthBarBg.setPosition(this.sprite.x, this.sprite.y - 100);
        this.healthBar.setPosition(this.sprite.x - 100, this.sprite.y - 100);
        this.healthText.setPosition(this.sprite.x, this.sprite.y - 100);
        
        // Update health bar width
        const healthPercent = this.health / this.maxHealth;
        this.healthBar.width = 200 * healthPercent;
        
        // Update health bar color based on health percentage
        if (healthPercent < 0.3) {
            this.healthBar.fillColor = 0xff0000; // Red when low health
        } else if (healthPercent < 0.6) {
            this.healthBar.fillColor = 0xff8800; // Orange when medium health
        } else {
            this.healthBar.fillColor = 0xff0000; // Red when high health (boss is always red)
        }
    }
    
    takeDamage(amount) {
        // Call parent method
        super.takeDamage(amount);
        
        // Update health bar
        if (this.active) {
            const healthPercent = this.health / this.maxHealth;
            this.healthBar.width = 200 * healthPercent; // Updated to match the new width (200 instead of 100)
            
            // Update health bar color based on health percentage
            if (healthPercent < 0.3) {
                this.healthBar.fillColor = 0xff0000; // Red when low health
            } else if (healthPercent < 0.6) {
                this.healthBar.fillColor = 0xff8800; // Orange when medium health
            } else {
                this.healthBar.fillColor = 0xff0000; // Red when high health (boss is always red)
            }
        }
    }
    
    destroy() {
        // Destroy health bar
        if (this.healthBarBg) {
            this.healthBarBg.destroy();
        }
        if (this.healthBar) {
            this.healthBar.destroy();
        }
        if (this.healthText) {
            this.healthText.destroy();
        }
        
        // Call parent destroy method
        super.destroy();
        
        // Show victory message
        this.scene.showMessage('BOSS ÎNVINS!', 5000);
        
        // Create a bigger explosion effect
        this.createBossExplosion();
    }
    
    createBossExplosion() {
        // Create multiple explosion effects for a more dramatic effect
        for (let i = 0; i < 12; i++) { // Increased from 5 to 12 explosions
            // Random position within boss area (larger area for bigger boss)
            const offsetX = Phaser.Math.Between(-80, 80); // Increased from -30/30
            const offsetY = Phaser.Math.Between(-80, 80); // Increased from -30/30
            
            // Create explosion with delay
            this.scene.time.delayedCall(i * 200, () => { // Faster sequence (300ms to 200ms)
                const explosion = this.scene.add.particles(
                    this.sprite.x + offsetX,
                    this.sprite.y + offsetY,
                    'bullet',
                    {
                        speed: { min: 80, max: 250 }, // Faster particles
                        scale: { start: 3, end: 0 }, // Larger particles
                        lifespan: 1500, // Longer lifespan
                        blendMode: 'ADD',
                        tint: [0xff0000, 0xff8800, 0xffff00],
                        quantity: 50 // More particles
                    }
                );
                
                // Add camera shake for dramatic effect
                if (i % 3 === 0) { // Every third explosion
                    this.scene.cameras.main.shake(300, 0.015);
                }
                
                // Auto-destroy particles after animation completes
                this.scene.time.delayedCall(1500, () => {
                    explosion.destroy();
                });
            });
        }
        
        // Add a final, massive explosion at the end
        this.scene.time.delayedCall(2500, () => {
            const finalExplosion = this.scene.add.particles(
                this.sprite.x,
                this.sprite.y,
                'bullet',
                {
                    speed: { min: 100, max: 300 },
                    scale: { start: 5, end: 0 },
                    lifespan: 2000,
                    blendMode: 'ADD',
                    tint: [0xff0000, 0xffffff],
                    quantity: 100
                }
            );
            
            // Strong camera shake for final explosion
            this.scene.cameras.main.shake(500, 0.03);
            
            // Auto-destroy particles after animation completes
            this.scene.time.delayedCall(2000, () => {
                finalExplosion.destroy();
            });
        });
    }
}