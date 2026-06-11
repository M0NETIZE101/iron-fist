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
        const attackData = this.cpuData.attacks.light;
        this.baseAttack.execute('light', attackData);
    }
    
    mediumAttack() {
        const attackData = this.cpuData.attacks.medium;
        this.baseAttack.execute('medium', attackData);
    }
    
    heavyAttack() {
        const attackData = this.cpuData.attacks.heavy;
        this.baseAttack.execute('heavy', attackData);
    }
    
    specialAttack() {
        if (this.scene.cpuSpecialCooldown > 0) return;
        const attackData = this.cpuData.attacks.special;
        this.scene.cpuSpecialCooldown = 180;
        this.baseAttack.execute('special', attackData);
    }
    
    superMove() {
        const scene = this.scene;
        if (!scene.roundActive || scene.cpuAttacking) return;
        if (scene.cpuSuperMeter < 100) return;
        
        const distance = Math.abs(scene.cpu.x - scene.player.x);
        const canHit = distance < 150;
        const damage = 32;
        
        scene.startSuperFreeze(250);
        
        scene.cpuSuperMeter = 0;
        if (scene.ui) scene.ui.updateHealthBars();
        
        const superText = scene.add.text(640, 300, 'CPU SUPER!!!', { 
            fontFamily: 'Anybody', fontSize: '70px', color: '#ffd700', fontStyle: 'bold italic',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);
        superText.setAlpha(0.8);
        superText.setDepth(200);
        scene.tweens.add({ targets: superText, alpha: 0, scale: 1.5, duration: 500, onComplete: () => superText.destroy() });
        
        this.animations.setCPUAnimation('heavy', 300, true);
        scene.cameras.main.shake(300, 0.03);
        scene.tweens.add({ targets: scene.impactFlash, alpha: 0.8, duration: 150, yoyo: true });
        
        if (canHit) {
            const isBlocked = scene.isBlocking;
            const finalDamage = isBlocked ? Math.floor(damage * 0.25) : damage;
            scene.playerHealth = Math.max(0, scene.playerHealth - finalDamage);
            scene.applyHitEffect(scene.player, finalDamage, true);
            if (scene.ui) scene.ui.updateHealthBars();
            
            if (scene.playerHealth <= 0) scene.endGame('cpu');
        }
    }
    
    decide() {
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
        const movementDelay = this.cpuSettings.movementDelay;
        
        if (this.moveTimer === 0) {
            if (isLowHealth) {
                if (scene.cpu.x < scene.player.x) {
                    scene.cpu.x = Math.max(scene.cpu.x - movementSpeed, MIN_X + 50);
                } else {
                    scene.cpu.x = Math.min(scene.cpu.x + movementSpeed, MAX_X - 50);
                }
                this.moveTimer = Math.floor(10 + Math.random() * 20);
            } else if (distance > optimalRange + 30) {
                if (scene.cpu.x < scene.player.x) {
                    scene.cpu.x = Math.min(scene.cpu.x + movementSpeed, MAX_X - 50);
                } else {
                    scene.cpu.x = Math.max(scene.cpu.x - movementSpeed, MIN_X + 50);
                }
                this.moveTimer = Math.floor(5 + Math.random() * (20 * movementDelay));
            } else if (distance < optimalRange - 20 && this.cpuPersonality.movementStyle !== 'FORWARD') {
                if (scene.cpu.x < scene.player.x) {
                    scene.cpu.x = Math.max(scene.cpu.x - movementSpeed, MIN_X + 50);
                } else {
                    scene.cpu.x = Math.min(scene.cpu.x + movementSpeed, MAX_X - 50);
                }
                this.moveTimer = Math.floor(15 + Math.random() * 25);
            } else {
                this.moveTimer = Math.floor(10 + Math.random() * 30);
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
            if (personality.type === 'ZONER') {
                specialChance = 0.4;
            } else if (personality.specialUsage === 'OFFENSIVE') {
                specialChance = 0.25;
            } else if (personality.specialUsage === 'REACTIVE') {
                specialChance = 0.2;
            } else {
                specialChance = 0.15;
            }
            
            if (attackChoice < specialChance && scene.cpuSpecialCooldown === 0) {
                this.specialAttack();
                return;
            }
            
            let lightWeight = 0.33, mediumWeight = 0.33, heavyWeight = 0.34;
            
            if (personality.type === 'ZONER') {
                lightWeight = 0.2;
                mediumWeight = 0.4;
                heavyWeight = 0.2;
            } else if (personality.playStyle === 'AGGRESSIVE') {
                lightWeight = 0.5;
                mediumWeight = 0.3;
                heavyWeight = 0.2;
            } else if (personality.playStyle === 'DEFENSIVE') {
                lightWeight = 0.5;
                mediumWeight = 0.3;
                heavyWeight = 0.2;
            } else if (personality.playStyle === 'BULLDOZER') {
                heavyWeight = 0.6;
                mediumWeight = 0.25;
                lightWeight = 0.15;
            } else if (personality.playStyle === 'COUNTER') {
                mediumWeight = 0.45;
                lightWeight = 0.3;
                heavyWeight = 0.25;
            }
            
            if (attackChoice < lightWeight) {
                this.lightAttack();
            } else if (attackChoice < lightWeight + mediumWeight) {
                this.mediumAttack();
            } else {
                this.heavyAttack();
            }
        }
    }
}