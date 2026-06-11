/**
 * BASE ATTACK - Unified attack logic for Player and CPU
 */

class BaseAttack {
    constructor(scene, attacker, target, animations, ui, isCPU = false) {
        this.scene = scene;
        this.attacker = attacker;
        this.target = target;
        this.animations = animations;
        this.ui = ui;
        this.isCPU = isCPU;
        this.attackData = null;
    }
    
    execute(attackType, attackData, onComplete = null) {
        this.attackData = attackData;
        
        if (this.isCPU) {
            if (this.scene.hasSuperArmor) return false;
            if (this.scene.cpuAttacking || !this.scene.roundActive || this.scene.isSuperFrozen) return false;
        } else {
            if (!this.scene.roundActive || this.scene.isAttacking || this.scene.isSuperFrozen) return false;
        }
        
        const distance = Math.abs(this.attacker.x - this.target.x);
        const canHit = distance < attackData.range;
        const damage = this.isCPU ? 
            Math.floor(attackData.damage * this.scene.cpuSettings.damageMultiplier) : 
            attackData.damage;
        
        // Play animation
        const animDuration = attackData.startup + attackData.active + attackData.recovery;
        if (this.isCPU) {
            this.animations.setCPUAnimation(attackType, animDuration);
        } else {
            this.animations.setPlayerAnimation(attackType, animDuration);
        }
        
        // Movement on attack
        if (!this.isCPU) {
            this.scene.tweens.add({ 
                targets: this.attacker, 
                x: this.attacker.x + (canHit ? attackData.pushback : 10), 
                duration: 50, 
                yoyo: true 
            });
        }
        
        if (canHit) {
            const isBlocked = this.isCPU ? 
                (this.scene.isBlocking && attackData.height === this.scene.playerBlockHeight) :
                (this.scene.cpuBlocking && attackData.height === this.scene.cpuBlockHeight);
            
            const finalDamage = isBlocked ? Math.floor(damage * 0.25) : damage;
            
            if (this.isCPU) {
                this.scene.playerHealth = Math.max(0, this.scene.playerHealth - finalDamage);
                this.scene.applyHitEffect(this.target, finalDamage, attackType === 'heavy');
                if (!isBlocked) {
                    this.scene.superMeter = Math.min(100, this.scene.superMeter + this.getMeterGain(attackType));
                }
            } else {
                this.scene.cpuHealth = Math.max(0, this.scene.cpuHealth - finalDamage);
                this.scene.applyHitEffect(this.target, finalDamage, attackType === 'heavy');
                if (!isBlocked) {
                    if (this.ui) this.ui.showCombo();
                    this.scene.cpuHitStun = this.getHitStun(attackType);
                    // CPU gains meter on taking damage (removed - only on dealing)
                }
            }
            
            this.ui.updateHealthBars();
            
            if (this.isCPU) {
                if (this.scene.playerHealth <= 0) this.scene.endGame('cpu');
            } else {
                if (this.scene.cpuHealth <= 0) this.scene.endGame('player');
            }
            
            return true;
        }
        
        return false;
    }
    
    getMeterGain(attackType) {
        switch(attackType) {
            case 'light': return 3;
            case 'medium': return 5;
            case 'heavy': return 8;
            case 'special': return 12;
            default: return 3;
        }
    }
    
    getHitStun(attackType) {
        switch(attackType) {
            case 'light': return 10;
            case 'medium': return 15;
            case 'heavy': return 20;
            case 'special': return 25;
            default: return 10;
        }
    }
}