/**
 * Boss
 * Handles the final boss enemy with special abilities
 */
class Boss extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy-car');
        
        // Override enemy properties for boss
        this.sprite.setScale(2.0); // Make boss bigger
        this.speed = 80; // Slower than regular enemies
        this.health = 50; // Much more health
        this.maxHealth = 50;
        this.damage = 30; // More damage on collision
        this.scoreValue = 5000; // Big score reward
        this.active = true;
        this.lastProjectileTime = 0;
        this.projectileCooldown = 2000; // ms between projectile volleys
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
        // Determine projectile pattern based on health
        const healthPercent = this.health / this.maxHealth;
        
        if (healthPercent > 0.7) {
            // Phase 1: Simple forward projectiles
            this.fireProjectileInDirection(0);
        } else if (healthPercent > 0.4) {
            // Phase 2: Three-way spread
            this.fireProjectileInDirection(-30);
            this.fireProjectileInDirection(0);
            this.fireProjectileInDirection(30);
        } else {
            // Phase 3: All directions
            for (let angle = 0; angle < 360; angle += 45) {
                this.fireProjectileInDirection(angle);
            }
        }
    }
    
    fireProjectileInDirection(angleOffset) {
        // Calculate angle (boss angle + offset)
        const baseAngle = this.sprite.rotation;
        const angle = baseAngle + Phaser.Math.DegToRad(angleOffset);
        
        // Create projectile
        const projectile = this.scene.physics.add.sprite(
            this.sprite.x,
            this.sprite.y,
            'bullet'
        );
        
        // Set projectile properties
        projectile.setTint(0xff0000);
        projectile.setScale(1.5);
        projectile.setDepth(5);
        projectile.isBossProjectile = true;
        
        // Set velocity based on angle
        const speed = 300;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        projectile.setVelocity(vx, vy);
        
        // Add to physics group for collision detection
        this.scene.bossProjectiles.add(projectile);
        
        // Set lifespan
        this.scene.time.delayedCall(2000, () => {
            if (projectile.active) {
                projectile.destroy();
            }
        });
        
        // Add visual effect
        this.scene.tweens.add({
            targets: projectile,
            alpha: { from: 0.8, to: 1 },
            duration: 200,
            yoyo: true,
            repeat: -1
        });
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
            this.sprite.y - 50,
            100,
            10,
            0x000000,
            0.7
        ).setDepth(15);
        
        // Create health bar
        this.healthBar = this.scene.add.rectangle(
            this.sprite.x - 50,
            this.sprite.y - 50,
            100,
            10,
            0xff0000,
            1
        ).setOrigin(0, 0.5).setDepth(16);
    }
    
    updateHealthBar() {
        // Update health bar position
        this.healthBarBg.setPosition(this.sprite.x, this.sprite.y - 50);
        this.healthBar.setPosition(this.sprite.x - 50, this.sprite.y - 50);
        
        // Update health bar width
        const healthPercent = this.health / this.maxHealth;
        this.healthBar.width = 100 * healthPercent;
    }
    
    takeDamage(amount) {
        // Call parent method
        super.takeDamage(amount);
        
        // Update health bar
        if (this.active) {
            const healthPercent = this.health / this.maxHealth;
            this.healthBar.width = 100 * healthPercent;
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
        
        // Call parent destroy method
        super.destroy();
        
        // Show victory message
        this.scene.showMessage('BOSS ÎNVINS!', 5000);
        
        // Create a bigger explosion effect
        this.createBossExplosion();
    }
    
    createBossExplosion() {
        // Create multiple explosion effects for a more dramatic effect
        for (let i = 0; i < 5; i++) {
            // Random position within boss area
            const offsetX = Phaser.Math.Between(-30, 30);
            const offsetY = Phaser.Math.Between(-30, 30);
            
            // Create explosion with delay
            this.scene.time.delayedCall(i * 300, () => {
                const explosion = this.scene.add.particles(
                    this.sprite.x + offsetX,
                    this.sprite.y + offsetY,
                    'bullet',
                    {
                        speed: { min: 50, max: 200 },
                        scale: { start: 2, end: 0 },
                        lifespan: 1000,
                        blendMode: 'ADD',
                        tint: [0xff0000, 0xff8800, 0xffff00],
                        quantity: 30
                    }
                );
                
                // Auto-destroy particles after animation completes
                this.scene.time.delayedCall(1000, () => {
                    explosion.destroy();
                });
            });
        }
    }
}