/**
 * BASE ATTACK - Unified attack logic with rectangle hitboxes
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
        
        // Get attacker and target positions
        const attackerX = this.attacker.x;
        const attackerY = this.attacker.y;
        const targetX = this.target.x;
        const targetY = this.target.y;
        
        // Get facing direction
        const facing = this.isCPU ? 
            getFacingDirection(this.scene.player.x, this.scene.cpu.x, 'cpu') :
            getFacingDirection(this.scene.player.x, this.scene.cpu.x, 'player');
        
        // Get attack hitbox
        const attackHitbox = getAttackHitbox(this.attacker, attackType, facing, attackerX, attackerY);
        
        // Get target hurtboxes with difficulty scaling for CPU
        const targetHurtboxes = this.isCPU ?
            getHurtboxes('cpu', targetX, targetY, this.scene.cpuSettings?.name || 'medium') :
            getHurtboxes('player', targetX, targetY, 'medium');
        
        // Check collision using rectangles
        const collision = getCollisionResult(attackHitbox, targetHurtboxes);
        const canHit = collision.hit;
        
        // Calculate damage with body part multiplier
        let damage = this.isCPU ? 
            Math.floor(attackData.damage * this.scene.cpuSettings.damageMultiplier) : 
            attackData.damage;
        
        if (canHit) {
            damage = Math.floor(damage * collision.multiplier);
        }
        
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
                this.scene.applyHitEffect(this.target, finalDamage, attackType === 'heavy', collision.bodyPart);
                if (!isBlocked) {
                    this.scene.superMeter = Math.min(100, this.scene.superMeter + this.getMeterGain(attackType));
                }
                if (this.ui) this.ui.updateHealthBars();
            } else {
                this.scene.cpuHealth = Math.max(0, this.scene.cpuHealth - finalDamage);
                this.scene.applyHitEffect(this.target, finalDamage, attackType === 'heavy', collision.bodyPart);
                if (!isBlocked) {
                    if (this.ui) this.ui.showCombo();
                    this.scene.cpuHitStun = this.getHitStun(attackType);
                }
                if (this.ui) this.ui.updateHealthBars();
            }
            
            if (this.isCPU) {
                if (this.scene.playerHealth <= 0) this.scene.endGame('cpu');
            } else {
                if (this.scene.cpuHealth <= 0) this.scene.endGame('player');
            }
            
            // Debug log for hit location
            if (window.DEBUG_HITBOXES) {
                console.log(`Hit ${collision.bodyPart}! Damage: ${finalDamage} (x${collision.multiplier})`);
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