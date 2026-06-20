/**
 * CPU - AI Decision Making & Attacks
 */

class CPUAttacks {
    constructor(scene, animations, cpuSettings, cpuPersonality) {
        this.scene = scene;
        this.animations = animations;
        this.cpuSettings = cpuSettings;
        this.cpuPersonality = cpuPersonality;
        this.cpuData = scene.cpuData;
        this.moveTimer = 0;
        this.baseAttack = new BaseAttack(scene, scene.cpu, scene.player, animations, null, true);
    }
    
    // FIXED: Use BaseAttack.execute() for consistent hit detection
    lightAttack() {
        if (this.scene.cpuLaunched) return;
        if (this.scene.hasSuperArmor) return;
        const attackData = this.cpuData.attacks.light;
        this.baseAttack.execute('light', attackData);
    }
    
    mediumAttack() {
        if (this.scene.cpuLaunched) return;
        if (this.scene.hasSuperArmor) return;
        const attackData = this.cpuData.attacks.medium;
        this.baseAttack.execute('medium', attackData);
    }
    
    heavyAttack() {
        if (this.scene.cpuLaunched) return;
        if (this.scene.hasSuperArmor) return;
        const attackData = this.cpuData.attacks.heavy;
        this.baseAttack.execute('heavy', attackData);
    }
    
    specialAttack() {
        if (this.scene.cpuLaunched) return;
        if (this.scene.hasSuperArmor) return;
        if (this.scene.cpuSpecialCooldown > 0) return;
        
        const attackData = this.cpuData.attacks.special;
        this.scene.cpuSpecialCooldown = 180;
        this.baseAttack.execute('special', attackData);
    }
    
    superMove() {
        if (this.scene.cpuLaunched) return;
        if (!this.scene.roundActive || this.scene.cpuAttacking) return;
        if (this.scene.cpuSuperMeter < 100) return;
        
        const distance = Math.abs(this.scene.cpu.x - this.scene.player.x);
        const canHit = distance < 150;
        const damage = 32;
        
        this.scene.startSuperFreeze(250);
        
        this.scene.cpuSuperMeter = 0;
        if (this.scene.ui) this.scene.ui.updateHealthBars();
        
        const superText = this.scene.add.text(640, 300, 'CPU SUPER!!!', { 
            fontFamily: 'Anybody', fontSize: '70px', color: '#ffd700', fontStyle: 'bold italic',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);
        superText.setAlpha(0.8);
        superText.setDepth(200);
        this.scene.tweens.add({ targets: superText, alpha: 0, scale: 1.5, duration: 500, onComplete: () => superText.destroy() });
        
        this.animations.setCPUAnimation('heavy', 300, true);
        this.scene.cameras.main.shake(300, 0.03);
        this.scene.tweens.add({ targets: this.scene.impactFlash, alpha: 0.8, duration: 150, yoyo: true });
        
        if (canHit) {
            const isBlocked = this.scene.isBlocking;
            const finalDamage = isBlocked ? Math.floor(damage * 0.25) : damage;
            this.scene.playerHealth = Math.max(0, this.scene.playerHealth - finalDamage);
            this.scene.applyHitEffect(this.scene.player, finalDamage, true);
            if (this.scene.ui) this.scene.ui.updateHealthBars();
            
            if (this.scene.playerHealth <= 0) this.scene.endGame('cpu');
        }
    }
    
    decide() {
        // Guard: Don't make decisions while launched
        if (this.scene.cpuLaunched) return;
        
        const scene = this.scene;
        if (!scene.roundActive || scene.cpuAttacking || scene.cpuHitStun > 0 || scene.isSuperFrozen) return;
        
        const distance = Math.abs(scene.cpu.x - scene.player.x);
        const healthPercent = scene.cpuHealth / 100;
        const retreatThreshold = this.cpuSettings.retreatThreshold;
        const isLowHealth = healthPercent < retreatThreshold;
        
        // ===== DOUBLE JUMP DECISION =====
        // If CPU is airborne and double jump is available
        if (scene.isJumping && scene.cpuJumpsUsed < 2 && scene.cpuDoubleJumpCooldown <= 0) {
            const personality = this.cpuPersonality;
            const shouldDoubleJump = Math.random() < 0.4; // 40% chance to consider it
            
            if (shouldDoubleJump) {
                let shouldUse = false;
                let boostDirection = 0;
                
                // KITE personality (ASHMIN) - use to create distance when player is close
                if (personality.movementStyle === 'KITE' && distance < 120) {
                    shouldUse = true;
                    // Boost away from player
                    boostDirection = scene.cpu.x < scene.player.x ? -1 : 1;
                }
                // FORWARD personality (ADARSHA, PRESIDENT) - use to close distance when player is far
                else if (personality.movementStyle === 'FORWARD' && distance > 150) {
                    shouldUse = true;
                    // Boost toward player
                    boostDirection = scene.cpu.x < scene.player.x ? 1 : -1;
                }
                // ADAPTIVE personality (ALPINE, BATMAN) - use based on situation
                else if (personality.movementStyle === 'ADAPTIVE') {
                    if (distance < 100 && scene.cpuHealth < 30) {
                        // Low health - retreat
                        shouldUse = true;
                        boostDirection = scene.cpu.x < scene.player.x ? -1 : 1;
                    } else if (distance > 160 && scene.cpuHealth > 50) {
                        // Healthy - advance
                        shouldUse = true;
                        boostDirection = scene.cpu.x < scene.player.x ? 1 : -1;
                    }
                }
                
                if (shouldUse && boostDirection !== 0) {
                    // Execute CPU double jump
                    scene.cpuYVelocity = DOUBLE_JUMP_VELOCITY;
                    scene.cpuJumpsUsed = 2;
                    scene.cpu.x += boostDirection * DOUBLE_JUMP_HORIZONTAL_BOOST;
                    if (scene.animations) scene.animations.setCPUAnimation('jump_regular', 300);
                    
                    // Log for debugging
                    if (window.DEBUG_HITBOXES) {
                        console.log('[CPU] Double jump used - direction:', boostDirection > 0 ? 'right' : 'left');
                    }
                }
            }
        }
        
        // Movement with delay
        if (this.moveTimer > 0) {
            this.moveTimer--;
        }
        
        const movementSpeed = 7;
        const optimalRange = this.cpuPersonality.optimalRange;
        
        if (this.moveTimer === 0) {
            if (isLowHealth) {
                if (scene.cpu.x < scene.player.x) {
                    scene.cpu.x = Math.max(scene.cpu.x - movementSpeed, MIN_X + 50);
                } else {
                    scene.cpu.x = Math.min(scene.cpu.x + movementSpeed, MAX_X - 50);
                }
                this.moveTimer = 5;
            } else {
                if (scene.cpu.x < scene.player.x) {
                    scene.cpu.x = Math.min(scene.cpu.x + movementSpeed, MAX_X - 50);
                } else {
                    scene.cpu.x = Math.max(scene.cpu.x - movementSpeed, MIN_X + 50);
                }
                this.moveTimer = 3;
            }
        }
        
        // Super check
        if (scene.cpuSuperMeter >= 100 && Math.random() < this.cpuSettings.superUsageChance && distance < 140) {
            this.superMove();
            return;
        }
        
        // Block decision
        let blockChance = this.cpuSettings.blockChance;
        if (this.cpuPersonality.defenseStyle === 'AGGRESSIVE_BLOCK') blockChance += 0.1;
        if (this.cpuPersonality.defenseStyle === 'PASSIVE_BLOCK') blockChance -= 0.1;
        scene.cpuBlockDecision = Math.random() < blockChance && distance < 120;
        if (!scene.cpuAttacking) {
            scene.cpuBlocking = scene.cpuBlockDecision;
            scene.cpuBlockHeight = Math.random() < 0.5 ? 'mid' : 'low';
        }
        
        // Attack decision
        const attackRange = this.cpuPersonality.optimalRange + 30;
        const shouldAttack = !isLowHealth || distance < 80;
        
        if (distance < attackRange && Math.random() < 0.5 && !scene.cpuAttacking && shouldAttack) {
            const attackChoice = Math.random();
            const personality = this.cpuPersonality;
            
            let specialChance;
            if (personality.type === 'ZONER') specialChance = 0.4;
            else if (personality.specialUsage === 'OFFENSIVE') specialChance = 0.25;
            else if (personality.specialUsage === 'REACTIVE') specialChance = 0.2;
            else specialChance = 0.15;
            
            if (attackChoice < specialChance && scene.cpuSpecialCooldown === 0) {
                this.specialAttack();
                return;
            }
            
            let lightWeight = 0.33, mediumWeight = 0.33, heavyWeight = 0.34;
            if (personality.type === 'ZONER') {
                lightWeight = 0.2; mediumWeight = 0.4; heavyWeight = 0.2;
            } else if (personality.playStyle === 'AGGRESSIVE') {
                lightWeight = 0.5; mediumWeight = 0.3; heavyWeight = 0.2;
            } else if (personality.playStyle === 'DEFENSIVE') {
                lightWeight = 0.5; mediumWeight = 0.3; heavyWeight = 0.2;
            } else if (personality.playStyle === 'BULLDOZER') {
                heavyWeight = 0.6; mediumWeight = 0.25; lightWeight = 0.15;
            } else if (personality.playStyle === 'COUNTER') {
                mediumWeight = 0.45; lightWeight = 0.3; heavyWeight = 0.25;
            }
            
            if (attackChoice < lightWeight) this.lightAttack();
            else if (attackChoice < lightWeight + mediumWeight) this.mediumAttack();
            else this.heavyAttack();
        }
    }
}