/**
 * PLAYER - Attack Methods
 */

class PlayerAttacks {
    constructor(scene, animations, ui) {
        this.scene = scene;
        this.animations = animations;
        this.ui = ui;
        this.playerData = scene.playerData;
        this.baseAttack = new BaseAttack(scene, scene.player, scene.cpu, animations, ui, false);
        this.createdObjects = [];
        this.attackState = null;
        this.timeoutId = null;  // FIXED: Declared timeoutId
    }
    
    lightAttack() {
        const attackData = this.playerData.attacks.light;
        this.attackState = { type: 'light', active: true };
        this.baseAttack.execute('light', attackData);
        // FIXED: Clear previous timeout before setting new one
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => { 
            if (this.attackState) this.attackState = null; 
        }, 500);
    }
    
    mediumAttack() {
        const attackData = this.playerData.attacks.medium;
        this.attackState = { type: 'medium', active: true };
        this.baseAttack.execute('medium', attackData);
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => { 
            if (this.attackState) this.attackState = null; 
        }, 500);
    }
    
    heavyAttack() {
        const attackData = this.playerData.attacks.heavy;
        this.attackState = { type: 'heavy', active: true };
        this.baseAttack.execute('heavy', attackData);
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => { 
            if (this.attackState) this.attackState = null; 
        }, 500);
    }
    
    standardSpecial() {
        const attackData = this.playerData.attacks.special;
        this.attackState = { type: 'special', active: true };
        this.baseAttack.execute('special', attackData);
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => { 
            if (this.attackState) this.attackState = null; 
        }, 500);
    }
    
    destroyObject(obj) {
        if (obj && obj.destroy) obj.destroy();
    }
    
    clearCreatedObjects() {
        this.createdObjects.forEach(obj => this.destroyObject(obj));
        this.createdObjects = [];
        this.attackState = null;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }
    
    // ASHMIN'S GOLDEN DRAGON FIST SPECIAL
    goldenDragonFist() {
        const scene = this.scene;
        if (!scene.roundActive || scene.isAttacking || scene.isSuperFrozen || scene.isJumping) return;
        if (scene.specialCooldown > 0) return;
        
        scene.specialCooldown = 300;
        scene.hasSuperArmor = true;
        this.attackState = { type: 'special', active: true };
        
        this.animations.setPlayerAnimation('light', 200);
        
        const facing = getFacingDirection(scene.player.x, scene.cpu.x, 'player');
        const direction = facing === 'right' ? 1 : -1;
        const startX = scene.player.x + (direction * 50);
        const startY = scene.player.y - 30;
        
        // Clear previous objects
        this.clearCreatedObjects();
        
        // Dragon appears
        const appearTimer = scene.time.delayedCall(200, () => {
            if (!scene.roundActive) return;
            
            const dragon1 = scene.add.image(startX, startY, 'ashmin_dragon_1');
            dragon1.setDisplaySize(100, 100);
            dragon1.setDepth(50);
            dragon1.setAlpha(0.95);
            this.createdObjects.push(dragon1);
            
            scene.tweens.add({ targets: dragon1, alpha: 0.6, duration: 100, yoyo: true });
            
            const whooshText = scene.add.text(startX, startY - 50, '🐉', {
                fontFamily: 'Anybody', fontSize: '30px', color: '#ffd700'
            }).setOrigin(0.5);
            this.createdObjects.push(whooshText);
            scene.tweens.add({ 
                targets: whooshText, 
                y: whooshText.y - 40, 
                alpha: 0, 
                duration: 400, 
                onComplete: () => this.destroyObject(whooshText) 
            });
            
            // Flight
            const flightTimer = scene.time.delayedCall(150, () => {
                if (!scene.roundActive) return;
                
                dragon1.setTexture('ashmin_dragon_2');
                dragon1.setDisplaySize(120, 120);
                
                const pauseTimer = scene.time.delayedCall(100, () => {
                    if (!scene.roundActive || !dragon1.active) return;
                    
                    const targetX = scene.cpu.x - (direction * 40);
                    scene.tweens.add({
                        targets: dragon1,
                        x: targetX,
                        y: scene.cpu.y - 50,
                        duration: 400,
                        ease: 'Power2',
                        onComplete: () => {
                            if (!scene.roundActive || !dragon1.active) return;
                            
                            dragon1.setTexture('ashmin_dragon_3');
                            dragon1.setDisplaySize(150, 150);
                            scene.cameras.main.shake(200, 0.015);
                            
                            const whiteFlash = scene.add.rectangle(640, 360, 1280, 720, 0xffffff, 0);
                            this.createdObjects.push(whiteFlash);
                            scene.tweens.add({ 
                                targets: whiteFlash, 
                                alpha: 0.4, 
                                duration: 80, 
                                yoyo: true, 
                                onComplete: () => this.destroyObject(whiteFlash) 
                            });
                            
                            const distance = Math.abs(dragon1.x - scene.cpu.x);
                            const canHit = distance < 70;
                            
                            if (canHit) {
                                const isBlocked = scene.cpuBlocking;
                                const baseDamage = 25;
                                const damage = isBlocked ? Math.floor(baseDamage * 0.25) : Math.floor(baseDamage * (this.playerData.power / 100));
                                scene.cpuHealth = Math.max(0, scene.cpuHealth - damage);
                                scene.applyHitEffect(scene.cpu, damage, true, 'special');
                                this.animations.setCPUAnimation('heavy', 200);
                                if (this.ui) this.ui.updateHealthBars();
                                
                                if (isBlocked) {
                                    const blockSpark = scene.add.rectangle(scene.cpu.x, scene.cpu.y - 30, 60, 60, 0x00dbe9);
                                    this.createdObjects.push(blockSpark);
                                    scene.tweens.add({ 
                                        targets: blockSpark, 
                                        alpha: 0, 
                                        scale: 0.5, 
                                        duration: 200, 
                                        onComplete: () => this.destroyObject(blockSpark) 
                                    });
                                } else {
                                    const coinExplosion = scene.add.image(scene.cpu.x, scene.cpu.y - 50, 'ashmin_coin_explosion');
                                    coinExplosion.setDisplaySize(160, 160);
                                    coinExplosion.setDepth(60);
                                    this.createdObjects.push(coinExplosion);
                                    scene.tweens.add({ 
                                        targets: coinExplosion, 
                                        scale: 1.5, 
                                        alpha: 0, 
                                        duration: 500, 
                                        onComplete: () => this.destroyObject(coinExplosion) 
                                    });
                                    
                                    const impactFlash = scene.add.image(scene.cpu.x, scene.cpu.y - 20, 'ashmin_coin_explosion');
                                    impactFlash.setDisplaySize(80, 80);
                                    impactFlash.setDepth(61);
                                    this.createdObjects.push(impactFlash);
                                    scene.tweens.add({ 
                                        targets: impactFlash, 
                                        scale: 2, 
                                        alpha: 0, 
                                        duration: 300, 
                                        onComplete: () => this.destroyObject(impactFlash) 
                                    });
                                }
                                
                                scene.time.timeScale = 0.15;
                                scene.time.delayedCall(150, () => { scene.time.timeScale = 1; });
                                
                                const specialText = scene.add.text(640, 300, 'GOLDEN DRAGON FIST!', {
                                    fontFamily: 'Anybody', fontSize: '42px', color: '#ffd700', fontStyle: 'bold italic',
                                    stroke: '#000000', strokeThickness: 4
                                }).setOrigin(0.5);
                                specialText.setDepth(200);
                                this.createdObjects.push(specialText);
                                scene.tweens.add({ 
                                    targets: specialText, 
                                    alpha: 0, 
                                    scale: 1.3, 
                                    duration: 800, 
                                    onComplete: () => this.destroyObject(specialText) 
                                });
                                
                                if (!isBlocked) {
                                    scene.comboCount += 3;
                                    if (scene.comboText) scene.comboText.setText(`DRAGON FIST! ${scene.comboCount} HITS!`);
                                    if (scene.comboText) scene.comboText.setAlpha(1);
                                }
                                
                                if (scene.cpuHealth <= 0) scene.endGame('player');
                            } else {
                                const missText = scene.add.text(640, 300, 'MISS!', {
                                    fontFamily: 'Anybody', fontSize: '36px', color: '#ff003c', fontStyle: 'bold italic',
                                    stroke: '#000000', strokeThickness: 3
                                }).setOrigin(0.5);
                                this.createdObjects.push(missText);
                                scene.tweens.add({ 
                                    targets: missText, 
                                    alpha: 0, 
                                    scale: 1.5, 
                                    duration: 500, 
                                    onComplete: () => this.destroyObject(missText) 
                                });
                            }
                            
                            // Clean up dragon
                            scene.time.delayedCall(500, () => {
                                this.destroyObject(dragon1);
                            });
                        }
                    });
                });
                this.createdObjects.push(pauseTimer);
            });
            this.createdObjects.push(flightTimer);
        });
        this.createdObjects.push(appearTimer);
        
        scene.time.delayedCall(1200, () => {
            scene.hasSuperArmor = false;
            this.attackState = null;
            this.clearCreatedObjects();
        });
    }
    
    superMove() {
        const scene = this.scene;
        if (!scene.roundActive || scene.isAttacking || scene.isJumping) return;
        if (scene.superMeter < 100) return;
        
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.attackState = { type: 'super', active: true };
        
        const distance = Math.abs(scene.player.x - scene.cpu.x);
        const canHit = distance < 150;
        const damage = 35;
        
        scene.startSuperFreeze(250);
        
        scene.superMeter = 0;
        if (this.ui) this.ui.updateHealthBars();
        
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
            scene.applyHitEffect(scene.cpu, finalDamage, true, 'super');
            this.animations.setCPUAnimation('heavy', 200, true);
            if (this.ui) this.ui.updateHealthBars();
            
            scene.comboCount += 5;
            if (scene.comboText) scene.comboText.setText(`SUPER COMBO! ${scene.comboCount} HITS!`);
            if (scene.comboText) scene.comboText.setAlpha(1);
            
            if (scene.cpuHealth <= 0) scene.endGame('player');
        } else {
            scene.superMeter = 50;
            if (this.ui) this.ui.updateHealthBars();
        }
        
        this.timeoutId = setTimeout(() => { 
            if (this.attackState) this.attackState = null; 
        }, 500);
    }
}