/**
 * PLAYER - Attack Methods
 */

class PlayerAttacks {
    constructor(scene, animations, ui) {
        this.scene = scene;
        this.animations = animations;
        this.ui = ui;
        this.playerData = scene.playerData;
    }
    
    lightAttack() {
        const scene = this.scene;
        if (!scene.roundActive || scene.isAttacking || scene.isSuperFrozen || scene.isJumping) return;
        
        const attackData = this.playerData.attacks.light;
        const distance = Math.abs(scene.player.x - scene.cpu.x);
        const canHit = distance < attackData.range;
        const damage = attackData.damage;
        
        this.animations.setPlayerAnimation('light', attackData.startup + attackData.active + attackData.recovery);
        scene.tweens.add({ targets: scene.player, x: scene.player.x + (canHit ? attackData.pushback : 10), duration: 50, yoyo: true });
        
        if (canHit) {
            const isBlocked = scene.cpuBlocking && attackData.height === scene.cpuBlockHeight;
            const finalDamage = isBlocked ? Math.floor(damage * 0.25) : damage;
            scene.cpuHealth = Math.max(0, scene.cpuHealth - finalDamage);
            scene.applyHitEffect(scene.cpu, finalDamage, false);
            this.animations.setCPUAnimation('light', 100);
            this.ui.updateHealthBars();
            
            if (!isBlocked) {
                this.ui.showCombo();
                scene.cpuHitStun = 10;
                scene.cpuSuperMeter = Math.min(100, scene.cpuSuperMeter + 3);
            }
            
            if (scene.cpuHealth <= 0) scene.endGame('player');
        }
    }
    
    mediumAttack() {
        const scene = this.scene;
        if (!scene.roundActive || scene.isAttacking || scene.isSuperFrozen || scene.isJumping) return;
        
        const attackData = this.playerData.attacks.medium;
        const distance = Math.abs(scene.player.x - scene.cpu.x);
        const canHit = distance < attackData.range;
        const damage = attackData.damage;
        
        this.animations.setPlayerAnimation('medium', attackData.startup + attackData.active + attackData.recovery);
        scene.tweens.add({ targets: scene.player, x: scene.player.x + (canHit ? attackData.pushback : 15), scaleX: 1.1, scaleY: 0.95, duration: 80, yoyo: true, ease: 'Back' });
        
        if (canHit) {
            const isBlocked = scene.cpuBlocking && attackData.height === scene.cpuBlockHeight;
            const finalDamage = isBlocked ? Math.floor(damage * 0.25) : damage;
            scene.cpuHealth = Math.max(0, scene.cpuHealth - finalDamage);
            scene.applyHitEffect(scene.cpu, finalDamage, true);
            this.animations.setCPUAnimation('medium', 120);
            this.ui.updateHealthBars();
            
            if (!isBlocked) {
                this.ui.showCombo();
                scene.cpuHitStun = 15;
                scene.cpuSuperMeter = Math.min(100, scene.cpuSuperMeter + 5);
            }
            
            if (scene.cpuHealth <= 0) scene.endGame('player');
        }
    }
    
    heavyAttack() {
        const scene = this.scene;
        if (!scene.roundActive || scene.isAttacking || scene.isSuperFrozen || scene.isJumping) return;
        
        const attackData = this.playerData.attacks.heavy;
        const distance = Math.abs(scene.player.x - scene.cpu.x);
        const canHit = distance < attackData.range;
        const damage = attackData.damage;
        
        this.animations.setPlayerAnimation('heavy', attackData.startup + attackData.active + attackData.recovery);
        scene.tweens.add({ targets: scene.player, x: scene.player.x + (canHit ? attackData.pushback : 15), scaleX: 1.15, scaleY: 0.9, duration: 100, yoyo: true, ease: 'Back' });
        
        if (canHit) {
            const isBlocked = scene.cpuBlocking && attackData.height === scene.cpuBlockHeight;
            const finalDamage = isBlocked ? Math.floor(damage * 0.25) : damage;
            scene.cpuHealth = Math.max(0, scene.cpuHealth - finalDamage);
            scene.applyHitEffect(scene.cpu, finalDamage, true);
            this.animations.setCPUAnimation('heavy', 120);
            this.ui.updateHealthBars();
            
            if (!isBlocked) {
                this.ui.showCombo();
                scene.cpuHitStun = 20;
                scene.cpuSuperMeter = Math.min(100, scene.cpuSuperMeter + 8);
            }
            
            if (scene.cpuHealth <= 0) scene.endGame('player');
        }
    }
    
    standardSpecial() {
        const scene = this.scene;
        const attackData = this.playerData.attacks.special;
        const distance = Math.abs(scene.player.x - scene.cpu.x);
        const canHit = distance < attackData.range;
        const damage = attackData.damage;
        
        this.animations.setPlayerAnimation('special', attackData.startup + attackData.active + attackData.recovery);
        scene.cameras.main.shake(150, 0.015);
        scene.tweens.add({ targets: scene.impactFlash, alpha: 0.5, duration: 100, yoyo: true });
        
        if (canHit) {
            const isBlocked = scene.cpuBlocking && attackData.height === scene.cpuBlockHeight;
            const finalDamage = isBlocked ? Math.floor(damage * 0.25) : damage;
            scene.cpuHealth = Math.max(0, scene.cpuHealth - finalDamage);
            scene.applyHitEffect(scene.cpu, finalDamage, true);
            this.animations.setCPUAnimation('special', 150);
            this.ui.updateHealthBars();
            
            if (!isBlocked) {
                this.ui.showCombo();
                scene.cpuHitStun = 25;
                scene.cpuSuperMeter = Math.min(100, scene.cpuSuperMeter + 12);
            }
            
            if (scene.cpuHealth <= 0) scene.endGame('player');
        }
    }
    
    // ASHMIN'S GOLDEN DRAGON FIST SPECIAL
    goldenDragonFist() {
        const scene = this.scene;
        if (!scene.roundActive || scene.isAttacking || scene.isSuperFrozen || scene.isJumping) return;
        if (scene.specialCooldown > 0) return;
        
        scene.specialCooldown = 240;
        scene.hasSuperArmor = true;
        
        this.animations.setPlayerAnimation('light', 150);
        
        const facing = getFacingDirection(scene.player.x, scene.cpu.x, 'player');
        const direction = facing === 'right' ? 1 : -1;
        const startX = scene.player.x + (direction * 50);
        const startY = scene.player.y - 30;
        
        scene.time.delayedCall(100, () => {
            if (!scene.roundActive) return;
            
            const dragon1 = scene.add.image(startX, startY, 'ashmin_dragon_1');
            dragon1.setDisplaySize(80, 80);
            dragon1.setDepth(50);
            dragon1.setAlpha(0.9);
            scene.tweens.add({ targets: dragon1, alpha: 0.5, duration: 50, yoyo: true });
            
            scene.time.delayedCall(80, () => {
                if (!scene.roundActive) return;
                
                dragon1.setTexture('ashmin_dragon_2');
                dragon1.setDisplaySize(100, 100);
                
                const targetX = scene.cpu.x - (direction * 30);
                scene.tweens.add({ targets: dragon1, x: targetX, y: scene.cpu.y - 40, duration: 200, ease: 'Power2' });
                
                scene.time.delayedCall(200, () => {
                    if (!scene.roundActive || !dragon1.active) return;
                    
                    dragon1.setTexture('ashmin_dragon_3');
                    dragon1.setDisplaySize(120, 120);
                    scene.cameras.main.shake(150, 0.01);
                    
                    const distance = Math.abs(dragon1.x - scene.cpu.x);
                    const canHit = distance < 60;
                    
                    if (canHit) {
                        const isBlocked = scene.cpuBlocking;
                        
                        if (isBlocked) {
                            const blockSpark = scene.add.rectangle(scene.cpu.x, scene.cpu.y - 30, 50, 50, 0x00dbe9);
                            blockSpark.setAlpha(0.7);
                            scene.tweens.add({ targets: blockSpark, alpha: 0, scale: 0.5, duration: 150, onComplete: () => blockSpark.destroy() });
                        } else {
                            const coinExplosion = scene.add.image(scene.cpu.x, scene.cpu.y - 50, 'ashmin_coin_explosion');
                            coinExplosion.setDisplaySize(120, 120);
                            coinExplosion.setDepth(60);
                            scene.tweens.add({ targets: coinExplosion, scale: 1.3, alpha: 0, duration: 400, onComplete: () => coinExplosion.destroy() });
                            
                            const impactFlash = scene.add.image(scene.cpu.x, scene.cpu.y - 20, 'ashmin_coin_explosion');
                            impactFlash.setDisplaySize(60, 60);
                            impactFlash.setDepth(61);
                            scene.tweens.add({ targets: impactFlash, scale: 1.5, alpha: 0, duration: 200, onComplete: () => impactFlash.destroy() });
                        }
                        
                        const baseDamage = 25;
                        const damage = isBlocked ? Math.floor(baseDamage * 0.25) : Math.floor(baseDamage * (this.playerData.power / 100));
                        scene.cpuHealth = Math.max(0, scene.cpuHealth - damage);
                        scene.applyHitEffect(scene.cpu, damage, true);
                        this.animations.setCPUAnimation('heavy', 150);
                        this.ui.updateHealthBars();
                        
                        scene.time.timeScale = 0.1;
                        scene.time.delayedCall(100, () => { scene.time.timeScale = 1; });
                        
                        const specialText = scene.add.text(640, 360, 'GOLDEN DRAGON FIST!', {
                            fontFamily: 'Anybody', fontSize: '32px', color: '#ffd700', fontStyle: 'bold italic',
                            stroke: '#000000', strokeThickness: 3
                        }).setOrigin(0.5);
                        scene.tweens.add({ targets: specialText, alpha: 0, scale: 1.5, duration: 600, onComplete: () => specialText.destroy() });
                        
                        if (!isBlocked) {
                            scene.comboCount += 3;
                            scene.comboText.setText(`DRAGON FIST! ${scene.comboCount} HITS!`);
                            scene.comboText.setAlpha(1);
                        }
                        
                        if (scene.cpuHealth <= 0) scene.endGame('player');
                    } else {
                        scene.time.delayedCall(100, () => { if (dragon1 && dragon1.active) dragon1.destroy(); });
                    }
                    
                    scene.time.delayedCall(400, () => { if (dragon1 && dragon1.active) dragon1.destroy(); });
                });
            });
        });
        
        scene.time.delayedCall(700, () => { scene.hasSuperArmor = false; });
    }
    
    superMove() {
        const scene = this.scene;
        if (!scene.roundActive || scene.isAttacking || scene.isJumping) return;
        if (scene.superMeter < 100) return;
        
        const distance = Math.abs(scene.player.x - scene.cpu.x);
        const canHit = distance < 150;
        const damage = 35;
        
        scene.startSuperFreeze(250);
        
        scene.superMeter = 0;
        this.ui.updateHealthBars();
        const superStatus = document.getElementById('superStatus');
        if (superStatus) {
            superStatus.style.opacity = '0';
            superStatus.classList.remove('super-pulse');
        }
        
        const superText = scene.add.text(640, 300, 'SUPER!!!', { 
            fontFamily: 'Anybody', fontSize: '80px', color: '#ffd700', fontStyle: 'bold italic',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);
        superText.setAlpha(0.8);
        superText.setDepth(200);
        scene.tweens.add({ targets: superText, alpha: 0, scale: 1.5, duration: 500, onComplete: () => superText.destroy() });
        
        this.animations.setPlayerAnimation('heavy', 300, true);
        scene.cameras.main.shake(300, 0.03);
        scene.tweens.add({ targets: scene.impactFlash, alpha: 0.8, duration: 150, yoyo: true });
        
        if (canHit) {
            const isBlocked = scene.cpuBlocking;
            const finalDamage = isBlocked ? Math.floor(damage * 0.25) : damage;
            scene.cpuHealth = Math.max(0, scene.cpuHealth - finalDamage);
            scene.applyHitEffect(scene.cpu, finalDamage, true);
            this.animations.setCPUAnimation('heavy', 200, true);
            this.ui.updateHealthBars();
            
            scene.comboCount += 5;
            scene.comboText.setText(`SUPER COMBO! ${scene.comboCount} HITS!`);
            scene.comboText.setAlpha(1);
            
            if (scene.cpuHealth <= 0) scene.endGame('player');
        } else {
            scene.superMeter = 50;
            this.ui.updateHealthBars();
        }
    }
}