/**
 * BASE ATTACK - Unified attack logic with rectangle hitboxes
 * FIXED: Startup frames, player hitstun, blocking matrix, attack lockout, attack heights
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
        this.attackType = null;
        this.facing = null;
        this.attackHitbox = null;
        this.isActive = false;
        this._pendingCheck = null;
        this._lockoutTimer = null;
    }
    
    execute(attackType, attackData, onComplete = null) {
        this.attackData = attackData;
        this.attackType = attackType;
        this.isActive = true;
        
        // Guard conditions
        if (this.isCPU) {
            if (this.scene.hasSuperArmor) return false;
            if (this.scene.cpuAttacking || !this.scene.roundActive || this.scene.isSuperFrozen) return false;
        } else {
            if (!this.scene.roundActive || this.scene.isAttacking || this.scene.isSuperFrozen) return false;
            // Check if player is in hitstun
            if (this.scene.isHitStun && this.scene.isHitStun > 0) return false;
        }
        
        // Get facing direction
        this.facing = this.isCPU ? 
            getFacingDirection(this.scene.player.x, this.scene.cpu.x, 'cpu') :
            getFacingDirection(this.scene.player.x, this.scene.cpu.x, 'player');
        
        // Total animation duration (Startup + Active + Recovery)
        const animDuration = attackData.startup + attackData.active + attackData.recovery;
        
        // ===== CRITICAL FIX: Lock out inputs for ENTIRE duration =====
        // This prevents attack spamming and ensures recovery frames are respected
        if (this.isCPU) {
            this.scene.cpuAttacking = true;
            // Unlock CPU when recovery finishes
            if (this._lockoutTimer) {
                this._lockoutTimer.remove();
                this._lockoutTimer = null;
            }
            this._lockoutTimer = this.scene.time.delayedCall(animDuration, () => {
                this.scene.cpuAttacking = false;
                this._lockoutTimer = null;
            });
        } else {
            this.scene.isAttacking = true;
            // Unlock Player when recovery finishes
            if (this._lockoutTimer) {
                this._lockoutTimer.remove();
                this._lockoutTimer = null;
            }
            this._lockoutTimer = this.scene.time.delayedCall(animDuration, () => {
                this.scene.isAttacking = false;
                this._lockoutTimer = null;
            });
        }
        
        // Play animation immediately (wind-up / startup)
        if (this.isCPU) {
            this.animations.setCPUAnimation(attackType, animDuration);
        } else {
            this.animations.setPlayerAnimation(attackType, animDuration);
        }
        
        // ===== DELAY THE HIT CHECK =====
        // Wait for startup frames to finish BEFORE checking collision
        // Cancel any pending check
        if (this._pendingCheck) {
            this._pendingCheck.remove();
            this._pendingCheck = null;
        }
        
        this._pendingCheck = this.scene.time.delayedCall(attackData.startup, () => {
            this._pendingCheck = null;
            
            // Don't proceed if the attacker or target is no longer valid
            if (!this.attacker || !this.attacker.active || !this.target || !this.target.active) return;
            if (!this.scene.roundActive) return;
            
            // Recalculate positions at the moment the attack becomes active
            const attackerX = this.attacker.x;
            const attackerY = this.attacker.y;
            const targetX = this.target.x;
            const targetY = this.target.y;
            
            // Recalculate facing (in case they crossed sides during startup)
            this.facing = this.isCPU ? 
                getFacingDirection(this.scene.player.x, this.scene.cpu.x, 'cpu') :
                getFacingDirection(this.scene.player.x, this.scene.cpu.x, 'player');
            
            // ===== FIX: Pass attackData.height to getAttackHitbox =====
            this.attackHitbox = getAttackHitbox(
                this.attacker, 
                attackType, 
                this.facing, 
                attackerX, 
                attackerY, 
                attackData.height  // <-- Pass the height property!
            );
            
            // Get target hurtboxes with difficulty scaling for CPU
            const targetHurtboxes = this.isCPU ?
                getHurtboxes('cpu', targetX, targetY, this.scene.cpuSettings?.name || 'medium') :
                getHurtboxes('player', targetX, targetY, 'medium');
            
            // Check collision using rectangles
            const collision = getCollisionResult(this.attackHitbox, targetHurtboxes);
            const canHit = collision.hit;
            
            // Calculate damage with body part multiplier
            let damage = this.isCPU ? 
                Math.floor(attackData.damage * this.scene.cpuSettings.damageMultiplier) : 
                attackData.damage;
            
            if (canHit) {
                damage = Math.floor(damage * collision.multiplier);
            }
            
            // ===== FIXED BLOCKING MATH =====
            // Determine if the target is blocking and what height they're blocking at
            const blockHeight = this.isCPU ? this.scene.playerBlockHeight : this.scene.cpuBlockHeight;
            const isBlocking = this.isCPU ? this.scene.isBlocking : this.scene.cpuBlocking;
            
            let isBlocked = false;
            if (isBlocking) {
                // Blocking matrix:
                // - Mid block stops: mid, high, overhead
                // - Low block stops: low only
                // - Overhead attacks beat low block
                if (blockHeight === 'mid' && (attackData.height === 'mid' || attackData.height === 'high' || attackData.height === 'overhead')) {
                    isBlocked = true;
                } else if (blockHeight === 'low' && attackData.height === 'low') {
                    isBlocked = true;
                }
                // Note: 'overhead' is NOT blocked by low block
                // Note: 'high' attacks are blocked by mid block but not low block
            }
            
            const finalDamage = isBlocked ? Math.floor(damage * 0.25) : damage;
            
            if (canHit) {
                if (this.isCPU) {
                    // ===== APPLY HITSTUN TO PLAYER =====
                    this.scene.playerHealth = Math.max(0, this.scene.playerHealth - finalDamage);
                    this.scene.applyHitEffect(this.target, finalDamage, attackType === 'heavy', collision.bodyPart);
                    
                    if (!isBlocked) {
                        // Apply hitstun to the player
                        this.scene.isHitStun = this.getHitStun(attackType);
                        // Cancel any player attack if they were hit mid-swing
                        this.scene.isAttacking = false;
                        // Clear any pending animation timer to prevent stale animations
                        if (this.animations && this.animations.clearTargetTimer) {
                            this.animations.clearTargetTimer(this.scene.player);
                        }
                        // Clear the lockout timer if attack was interrupted
                        if (this._lockoutTimer) {
                            this._lockoutTimer.remove();
                            this._lockoutTimer = null;
                        }
                        // Gain super meter for landing a hit
                        this.scene.superMeter = Math.min(100, this.scene.superMeter + this.getMeterGain(attackType));
                    }
                    if (this.ui) this.ui.updateHealthBars();
                } else {
                    this.scene.cpuHealth = Math.max(0, this.scene.cpuHealth - finalDamage);
                    this.scene.applyHitEffect(this.target, finalDamage, attackType === 'heavy', collision.bodyPart);
                    
                    if (!isBlocked) {
                        // CPU hitstun
                        this.scene.cpuHitStun = this.getHitStun(attackType);
                        // Show combo
                        if (this.ui) this.ui.showCombo();
                        // Cancel CPU attack if hit mid-swing
                        this.scene.cpuAttacking = false;
                        if (this.animations && this.animations.clearTargetTimer) {
                            this.animations.clearTargetTimer(this.scene.cpu);
                        }
                        // Clear the lockout timer if attack was interrupted
                        if (this._lockoutTimer) {
                            this._lockoutTimer.remove();
                            this._lockoutTimer = null;
                        }
                    }
                    if (this.ui) this.ui.updateHealthBars();
                }
                
                // Movement on hit (pushback)
                if (!this.isCPU) {
                    this.scene.tweens.add({ 
                        targets: this.attacker, 
                        x: this.attacker.x + attackData.pushback, 
                        duration: 50, 
                        yoyo: true 
                    });
                }
                
                // Check for K.O.
                if (this.isCPU) {
                    if (this.scene.playerHealth <= 0) this.scene.endGame('cpu');
                } else {
                    if (this.scene.cpuHealth <= 0) this.scene.endGame('player');
                }
                
                // Debug log for hit location
                if (window.DEBUG_HITBOXES) {
                    console.log(`Hit ${collision.bodyPart}! Damage: ${finalDamage} (x${collision.multiplier})`);
                }
                
                // Clean up
                this.isActive = false;
                this._pendingCheck = null;
                return true;
            } else {
                // Miss
                if (window.DEBUG_HITBOXES) {
                    console.log(`Attack missed!`);
                }
                
                // Clean up
                this.isActive = false;
                this._pendingCheck = null;
                return false;
            }
        });
        
        // Movement on attack startup (forward momentum)
        if (!this.isCPU) {
            this.scene.tweens.add({ 
                targets: this.attacker, 
                x: this.attacker.x + 10, 
                duration: 50, 
                yoyo: true 
            });
        }
        
        return true;
    }
    
    // Cancel any pending attack (useful for hitstun interrupting attacks)
    cancel() {
        if (this._pendingCheck) {
            this._pendingCheck.remove();
            this._pendingCheck = null;
        }
        if (this._lockoutTimer) {
            this._lockoutTimer.remove();
            this._lockoutTimer = null;
        }
        this.isActive = false;
        // Reset attack flags if this was the active attack
        if (this.isCPU) {
            this.scene.cpuAttacking = false;
        } else {
            this.scene.isAttacking = false;
        }
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
            case 'light': return 150; // ~9 frames at 60fps
            case 'medium': return 200; // ~12 frames
            case 'heavy': return 300; // ~18 frames
            case 'special': return 400; // ~24 frames
            default: return 150;
        }
    }
}
