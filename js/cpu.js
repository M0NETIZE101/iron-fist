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
    
    lightAttack() {
        // Guard: Don't attack while launched
        if (this.scene.cpuLaunched) return;
        if (this.scene.hasSuperArmor) return;
        if (this.scene.cpuAttacking || !this.scene.roundActive || this.scene.isSuperFrozen) return;
        
        const attackData = this.cpuData.attacks.light;
        const distance = Math.abs(this.scene.cpu.x - this.scene.player.x);
        const canHit = distance < attackData.range;
        const damage = Math.floor(attackData.damage * this.cpuSettings.damageMultiplier);
        
        this.animations.setCPUAnimation('light', attackData.startup + attackData.active + attackData.recovery);
        
        if (canHit) {
            const isBlocked = this.scene.isBlocking && attackData.height === this.scene.playerBlockHeight;
            const finalDamage = isBlocked ? Math.floor(damage * 0.25) : damage;
            this.scene.playerHealth = Math.max(0, this.scene.playerHealth - finalDamage);
            this.scene.applyHitEffect(this.scene.player, finalDamage, false);
            if (this.scene.ui) this.scene.ui.updateHealthBars();
            
            if (!isBlocked) {
                this.scene.superMeter = Math.min(100, this.scene.superMeter + 3);
            }
            
            if (this.scene.playerHealth <= 0) this.scene.endGame('cpu');
        }
    }
    
    mediumAttack() {
        if (this.scene.cpuLaunched) return;
        if (this.scene.hasSuperArmor) return;
        if (this.scene.cpuAttacking || !this.scene.roundActive || this.scene.isSuperFrozen) return;
        
        const attackData = this.cpuData.attacks.medium;
        const distance = Math.abs(this.scene.cpu.x - this.scene.player.x);
        const canHit = distance < attackData.range;
        const damage = Math.floor(attackData.damage * this.cpuSettings.damageMultiplier);
        
        this.animations.setCPUAnimation('medium', attackData.startup + attackData.active + attackData.recovery);
        
        if (canHit) {
            const isBlocked = this.scene.isBlocking && attackData.height === this.scene.playerBlockHeight;
            const finalDamage = isBlocked ? Math.floor(damage * 0.25) : damage;
            this.scene.playerHealth = Math.max(0, this.scene.playerHealth - finalDamage);
            this.scene.applyHitEffect(this.scene.player, finalDamage, true);
            if (this.scene.ui) this.scene.ui.updateHealthBars();
            
            if (!isBlocked) {
                this.scene.superMeter = Math.min(100, this.scene.superMeter + 5);
            }
            
            if (this.scene.playerHealth <= 0) this.scene.endGame('cpu');
        }
    }
    
    heavyAttack() {
        if (this.scene.cpuLaunched) return;
        if (this.scene.hasSuperArmor) return;
        if (this.scene.cpuAttacking || !this.scene.roundActive || this.scene.isSuperFrozen) return;
        
        const attackData = this.cpuData.attacks.heavy;
        const distance = Math.abs(this.scene.cpu.x - this.scene.player.x);
        const canHit = distance < attackData.range;
        const damage = Math.floor(attackData.damage * this.cpuSettings.damageMultiplier);
        
        this.animations.setCPUAnimation('heavy', attackData.startup + attackData.active + attackData.recovery);
        
        if (canHit) {
            const isBlocked = this.scene.isBlocking && attackData.height === this.scene.playerBlockHeight;
            const finalDamage = isBlocked ? Math.floor(damage * 0.25) : damage;
            this.scene.playerHealth = Math.max(0, this.scene.playerHealth - finalDamage);
            this.scene.applyHitEffect(this.scene.player, finalDamage, true);
            if (this.scene.ui) this.scene.ui.updateHealthBars();
            
            if (!isBlocked) {
                this.scene.superMeter = Math.min(100, this.scene.superMeter + 8);
            }
            
            if (this.scene.playerHealth <= 0) this.scene.endGame('cpu');
        }
    }
    
    specialAttack() {
        if (this.scene.cpuLaunched) return;
        if (this.scene.hasSuperArmor) return;
        if (this.scene.cpuAttacking || !this.scene.roundActive || this.scene.isSuperFrozen) return;
        if (this.scene.cpuSpecialCooldown > 0) return;
        
        const attackData = this.cpuData.attacks.special;
        const distance = Math.abs(this.scene.cpu.x - this.scene.player.x);
        const canHit = distance < attackData.range;
        const damage = Math.floor(attackData.damage * this.cpuSettings.damageMultiplier);
        
        this.scene.cpuSpecialCooldown = 180;
        this.animations.setCPUAnimation('special', attackData.startup + attackData.active + attackData.recovery);
        this.scene.cameras.main.shake(120, 0.01);
        
        if (canHit) {
            const isBlocked = this.scene.isBlocking && attackData.height === this.scene.playerBlockHeight;
            const finalDamage = isBlocked ? Math.floor(damage * 0.25) : damage;
            this.scene.playerHealth = Math.max(0, this.scene.playerHealth - finalDamage);
            this.scene.applyHitEffect(this.scene.player, finalDamage, true);
            if (this.scene.ui) this.scene.ui.updateHealthBars();
            
            if (!isBlocked) {
                this.scene.superMeter = Math.min(100, this.scene.superMeter + 12);
            }
            
            if (this.scene.playerHealth <= 0) this.scene.endGame('cpu');
        }
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