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
        this.timeoutId = null;
    }
    
    lightAttack() {
        const attackData = this.playerData.attacks.light;
        this.attackState = { type: 'light', active: true };
        this.baseAttack.execute('light', attackData);
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
    
   
// ========== ADARSHA'S JUMP + FIRE SPECIAL ==========
adarshaSpecial() {
    const scene = this.scene;
    if (!scene.roundActive || scene.isSuperFrozen || scene.isJumping) return;
    if (scene.specialCooldown > 0) return;
    
    console.log('Adarsha special started!');
    
    scene.specialCooldown = 300;
    scene.hasSuperArmor = true;
    this.attackState = { type: 'special', active: true };
    
    // ========== PHASE 1: Jumpstart ==========
    // FIXED: bypassAttackGuard = true (4th parameter)
    this.animations.setPlayerAnimation('jumpstart', 150, false, true);
    
    // Lift player into the air
    scene.isJumping = true;
    scene.playerYVelocity = JUMP_VELOCITY;
    
    scene.time.delayedCall(150, () => {
        if (!scene.roundActive) return;
        
        this.animations.setPlayerAnimation('jump', 100, false, true);
        
        scene.time.delayedCall(100, () => {
            if (!scene.roundActive) return;
            
            this.animations.setPlayerAnimation('jumpkick', 150, false, true);
            scene.cameras.main.shake(120, 0.012);
            
            const distance = Math.abs(scene.player.x - scene.cpu.x);
            const canHit = distance < 100;
            
            if (canHit) {
                const isBlocked = scene.cpuBlocking;
                const damage = isBlocked ? 5 : 20;
                scene.cpuHealth = Math.max(0, scene.cpuHealth - damage);
                scene.applyHitEffect(scene.cpu, damage, true, 'kick');
                this.animations.setCPUAnimation('hurt', 200);
                
                if (!isBlocked) {
                    scene.cpuLaunched = true;
                    scene.cpuLaunchVelocity = -380;
                    scene.comboCount += 2;
                    if (scene.comboText) scene.comboText.setText(`LAUNCHER! ${scene.comboCount} HITS!`);
                    if (scene.comboText) scene.comboText.setAlpha(1);
                    if (this.ui) this.ui.updateHealthBars();
                }
            }
            
            scene.time.delayedCall(200, () => {
                if (!scene.roundActive) return;
                
                this.animations.setPlayerAnimation('firestart', 200, false, true);
                
                scene.time.delayedCall(180, () => {
                    if (!scene.roundActive) return;
                    
                    this.animations.setPlayerAnimation('firing', 250, false, true);
                    
                    const facing = getFacingDirection(scene.player.x, scene.cpu.x, 'player');
                    const direction = facing === 'right' ? 1 : -1;
                    const startX = scene.player.x + (direction * 60);
                    const startY = scene.player.y - 20;
                    
                    let fireball;
                    if (scene.textures.exists('adarsha_fireball')) {
                        fireball = scene.add.image(startX, startY, 'adarsha_fireball');
                        fireball.setDisplaySize(45, 45);
                    } else {
                        fireball = scene.add.circle(startX, startY, 15, 0xff6600);
                    }
                    fireball.setDepth(55);
                    this.createdObjects.push(fireball);
                    
                    const targetX = scene.cpu.x;
                    scene.tweens.add({
                        targets: fireball,
                        x: targetX,
                        y: scene.cpu.y - 40,
                        duration: 200,
                        ease: 'Power2',
                        onComplete: () => {
                            const finalDist = Math.abs(fireball.x - scene.cpu.x);
                            if (finalDist < 70) {
                                const isBlocked = scene.cpuBlocking;
                                const damage = isBlocked ? 6 : 16;
                                scene.cpuHealth = Math.max(0, scene.cpuHealth - damage);
                                scene.applyHitEffect(scene.cpu, damage, true, 'fire');
                                if (this.ui) this.ui.updateHealthBars();
                                
                                if (!isBlocked) {
                                    scene.comboCount += 2;
                                    if (scene.comboText) scene.comboText.setText(`FIRE! ${scene.comboCount} HITS!`);
                                    if (scene.comboText) scene.comboText.setAlpha(1);
                                }
                                
                                if (scene.cpuHealth <= 0) scene.endGame('player');
                            }
                            this.destroyObject(fireball);
                        }
                    });
                    
                    scene.time.delayedCall(500, () => {
                        scene.hasSuperArmor = false;
                        this.attackState = null;
                    });
                });
            });
        });
    });
    
    scene.time.delayedCall(900, () => {
        if (scene.isJumping) {
            scene.isJumping = false;
            scene.playerYVelocity = 0;
            scene.player.y = GROUND_Y;
        }
    });
}
    
    // ========== ASHMIN'S GOLDEN DRAGON FIST ==========
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
        
        this.clearCreatedObjects();
        
        scene.time.delayedCall(200, () => {
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
            
            scene.time.delayedCall(150, () => {
                if (!scene.roundActive) return;
                
                dragon1.setTexture('ashmin_dragon_2');
                dragon1.setDisplaySize(120, 120);
                
                scene.time.delayedCall(100, () => {
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
                            
                            scene.time.delayedCall(500, () => {
                                this.destroyObject(dragon1);
                            });
                        }
                    });
                });
            });
        });
        
        scene.time.delayedCall(1200, () => {
            scene.hasSuperArmor = false;
            this.attackState = null;
            this.clearCreatedObjects();
        });
    }
    
    // ========== ALPINE'S THREE-PHASE SPECIAL ==========
alpineSpecial() {
    const scene = this.scene;
    if (!scene.roundActive || scene.isAttacking || scene.isSuperFrozen || scene.isJumping) return;
    if (scene.specialCooldown > 0) return;
    
    console.log('Alpine special started!');
    
    scene.specialCooldown = 240;
    scene.hasSuperArmor = true;
    this.attackState = { type: 'special', active: true };
    
    // Phase 1: Drink
    this.animations.setPlayerAnimation('special_drink', 450);
    
    scene.time.delayedCall(450, () => {
        if (!scene.roundActive) return;
        
        // Phase 2: Power-up
        this.animations.setPlayerAnimation('special_powerup', 500);
        scene.playerAura.setFillStyle(0xffd700);
        scene.playerAura.setAlpha(0.6);
        
        const glowRing = scene.add.circle(scene.player.x, scene.player.y, 60, 0xffd700, 0.3);
        scene.tweens.add({ targets: glowRing, scale: 1.5, alpha: 0, duration: 500, onComplete: () => glowRing.destroy() });
        
        for (let i = 0; i < 8; i++) {
            const particle = scene.add.circle(scene.player.x - 30 + (i * 10), scene.player.y + 30, 4, 0xffd700, 0.8);
            scene.tweens.add({ targets: particle, y: particle.y - 80, alpha: 0, duration: 500, delay: i * 30, onComplete: () => particle.destroy() });
        }
        
        scene.time.delayedCall(500, () => {
            if (!scene.roundActive) return;
            
            // Phase 3: Energy Fist
            const distance = Math.abs(scene.player.x - scene.cpu.x);
            const canHit = distance < 140;
            
            scene.playerAura.setFillStyle(this.playerData.color);
            scene.playerAura.setAlpha(0.15);
            
            scene.time.timeScale = 0.3;
            scene.cameras.main.shake(80, 0.008);
            
            const warningText = scene.add.text(640, 300, '⚠️ ENERGY FIST INCOMING! ⚠️', {
                fontFamily: 'Anybody', fontSize: '28px', color: '#ff003c', fontStyle: 'bold italic',
                stroke: '#000000', strokeThickness: 3
            }).setOrigin(0.5);
            warningText.setDepth(200);
            scene.tweens.add({ targets: warningText, alpha: 0, scale: 1.2, duration: 200, onComplete: () => warningText.destroy() });
            
            scene.time.delayedCall(250, () => {
                scene.time.timeScale = 1;
                
                this.animations.setPlayerAnimation('special_attack', 300);
                
                const fistX = canHit ? scene.cpu.x - 50 : scene.player.x + (getFacingDirection(scene.player.x, scene.cpu.x, 'player') === 'right' ? 80 : -80);
                
                if (scene.textures.exists('energyFist')) {
                    const energyFist = scene.add.image(fistX, scene.cpu.y - 30, 'energyFist');
                    energyFist.setDisplaySize(100, 100);
                    energyFist.setDepth(50);
                    scene.tweens.add({ targets: energyFist, scale: 1.5, alpha: 0, duration: 300, onComplete: () => energyFist.destroy() });
                }
                
                scene.cameras.main.shake(200, 0.015);
                
                if (canHit) {
                    const isBlocked = scene.cpuBlocking;
                    const damage = isBlocked ? Math.floor(26 * 0.25) : 26;
                    
                    scene.time.timeScale = 0.1;
                    scene.time.delayedCall(100, () => { scene.time.timeScale = 1; });
                    
                    scene.cpuHealth = Math.max(0, scene.cpuHealth - damage);
                    scene.applyHitEffect(scene.cpu, damage, true, 'fist');
                    this.animations.setCPUAnimation('heavy', 200);
                    if (this.ui) this.ui.updateHealthBars();
                    
                    const specialText = scene.add.text(640, 360, 'ENERGY FIST!', {
                        fontFamily: 'Anybody', fontSize: '36px', color: '#ffd700', fontStyle: 'bold italic',
                        stroke: '#000000', strokeThickness: 3
                    }).setOrigin(0.5);
                    scene.tweens.add({ targets: specialText, alpha: 0, scale: 1.5, duration: 500, onComplete: () => specialText.destroy() });
                    
                    scene.comboCount += 3;
                    if (scene.comboText) scene.comboText.setText(`SPECIAL! ${scene.comboCount} HITS!`);
                    if (scene.comboText) scene.comboText.setAlpha(1);
                    
                    if (scene.cpuHealth <= 0) scene.endGame('player');
                } else {
                    const missText = scene.add.text(640, 360, 'MISS!', {
                        fontFamily: 'Anybody', fontSize: '36px', color: '#ff003c', fontStyle: 'bold italic',
                        stroke: '#000000', strokeThickness: 3
                    }).setOrigin(0.5);
                    scene.tweens.add({ targets: missText, alpha: 0, scale: 1.5, duration: 500, onComplete: () => missText.destroy() });
                }
                
                scene.time.delayedCall(500, () => {
                    scene.hasSuperArmor = false;
                    this.attackState = null;
                });
            });
        });
    });
}

// ========== IRON MAN'S REPULSOR BLAST SPECIAL ==========
ironmanSpecial() {
    const scene = this.scene;
    if (!scene.roundActive || scene.isAttacking || scene.isSuperFrozen || scene.isJumping) return;
    if (scene.specialCooldown > 0) return;
    
    console.log('Iron Man special started!');
    
    scene.specialCooldown = 280;
    scene.hasSuperArmor = true;
    this.attackState = { type: 'special', active: true };
    
    // ========== PHASE 1: Charge up - use special pose ==========
    this.animations.setPlayerAnimation('special', 200, false, true);
    
    // Charging effect
    const chargeGlow = scene.add.circle(scene.player.x + 30, scene.player.y - 20, 30, 0x00aaff, 0.5);
    scene.tweens.add({ targets: chargeGlow, scale: 1.5, alpha: 0, duration: 200, onComplete: () => chargeGlow.destroy() });
    
    scene.time.delayedCall(200, () => {
        if (!scene.roundActive) return;
        
        // ========== PHASE 2: Fire Repulsor Blast ==========
        this.animations.setPlayerAnimation('special', 250, false, true);
        
        const facing = getFacingDirection(scene.player.x, scene.cpu.x, 'player');
        const direction = facing === 'right' ? 1 : -1;
        const startX = scene.player.x + (direction * 70);
        const startY = scene.player.y - 30;
        
        // Create repulsor beam/projectile using the uploaded repulsor.png
        let repulsor;
        if (scene.textures.exists('ironman_repulsor')) {
            repulsor = scene.add.image(startX, startY, 'ironman_repulsor');
            repulsor.setDisplaySize(60, 30);
            repulsor.setDepth(55);
        } else {
            // Fallback to circle if texture is missing
            repulsor = scene.add.ellipse(startX, startY, 40, 20, 0x00aaff);
            repulsor.setDepth(55);
        }
        this.createdObjects.push(repulsor);
        
        // Add glow effect
        const beamGlow = scene.add.ellipse(startX, startY, 50, 30, 0x00ccff, 0.6);
        this.createdObjects.push(beamGlow);
        
        // Move toward CPU
        const targetX = scene.cpu.x;
        scene.tweens.add({
            targets: [repulsor, beamGlow],
            x: targetX,
            y: scene.cpu.y - 40,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                const finalDist = Math.abs(repulsor.x - scene.cpu.x);
                if (finalDist < 80) {
                    const isBlocked = scene.cpuBlocking;
                    const baseDamage = 24;
                    const damage = isBlocked ? Math.floor(baseDamage * 0.25) : Math.floor(baseDamage * (this.playerData.power / 100));
                    scene.cpuHealth = Math.max(0, scene.cpuHealth - damage);
                    scene.applyHitEffect(scene.cpu, damage, true, 'energy');
                    this.animations.setCPUAnimation('heavy', 200);
                    if (this.ui) this.ui.updateHealthBars();
                    
                    // Explosion effect
                    const explosion = scene.add.circle(scene.cpu.x, scene.cpu.y - 40, 35, 0xff6600, 0.8);
                    scene.tweens.add({ targets: explosion, alpha: 0, scale: 1.5, duration: 200, onComplete: () => explosion.destroy() });
                    
                    // Impact text
                    const impactText = scene.add.text(640, 360, 'REPULSOR BLAST!', {
                        fontFamily: 'Anybody', fontSize: '32px', color: '#00aaff', fontStyle: 'bold italic',
                        stroke: '#000000', strokeThickness: 3
                    }).setOrigin(0.5);
                    scene.tweens.add({ targets: impactText, alpha: 0, scale: 1.3, duration: 500, onComplete: () => impactText.destroy() });
                    
                    if (!isBlocked) {
                        scene.comboCount += 2;
                        if (scene.comboText) scene.comboText.setText(`REPULSOR! ${scene.comboCount} HITS!`);
                        if (scene.comboText) scene.comboText.setAlpha(1);
                    }
                    
                    if (scene.cpuHealth <= 0) scene.endGame('player');
                }
                this.destroyObject(repulsor);
                this.destroyObject(beamGlow);
            }
        });
        
        scene.time.delayedCall(400, () => {
            scene.hasSuperArmor = false;
            this.attackState = null;
        });
    });
}

// ========== BATMAN'S BATARANG BARRAGE SPECIAL ==========
batmanSpecial() {
    const scene = this.scene;
    if (!scene.roundActive || scene.isAttacking || scene.isSuperFrozen || scene.isJumping) return;
    if (scene.specialCooldown > 0) return;
    
    console.log('Batman special started!');
    
    scene.specialCooldown = 240;
    scene.hasSuperArmor = true;
    this.attackState = { type: 'special', active: true };
    
    // ========== PHASE 1: Throw pose ==========
    this.animations.setPlayerAnimation('special', 200, false, true);
    
    scene.time.delayedCall(200, () => {
        if (!scene.roundActive) return;
        
        // ========== PHASE 2: Launch Batarang ==========
        const facing = getFacingDirection(scene.player.x, scene.cpu.x, 'player');
        const direction = facing === 'right' ? 1 : -1;
        const startX = scene.player.x + (direction * 60);
        const startY = scene.player.y - 30;
        
        // Create Batarang using the uploaded image
        let batarang;
        if (scene.textures.exists('batman_batarang')) {
            batarang = scene.add.image(startX, startY, 'batman_batarang');
            batarang.setDisplaySize(40, 40);
            batarang.setDepth(55);
        } else {
            // Fallback to a triangle if texture is missing
            batarang = scene.add.triangle(startX, startY, 0, -15, -10, 15, 10, 15, 0x2a2a2a);
            batarang.setDepth(55);
        }
        this.createdObjects.push(batarang);
        
        // Add glow effect
        const glow = scene.add.ellipse(startX, startY, 50, 50, 0xffd700, 0.2);
        this.createdObjects.push(glow);
        
        // Calculate target position (slightly above CPU)
        const targetX = scene.cpu.x;
        const targetY = scene.cpu.y - 40;
        
        // Distance and duration for the flight
        const distance = Math.abs(targetX - startX);
        const duration = Math.min(Math.max(distance * 1.5, 150), 400);
        
        // Animate the Batarang flying to target with rotation
        scene.tweens.add({
            targets: batarang,
            x: targetX,
            y: targetY,
            duration: duration,
            ease: 'Power2',
            angle: direction * 720, // 2 full rotations (720 degrees) while flying
            onUpdate: () => {
                // Make glow follow the Batarang
                if (glow && glow.active) {
                    glow.x = batarang.x;
                    glow.y = batarang.y;
                }
            },
            onComplete: () => {
                const finalDist = Math.abs(batarang.x - scene.cpu.x);
                if (finalDist < 80) {
                    // Hit!
                    const isBlocked = scene.cpuBlocking;
                    const baseDamage = 20;
                    const damage = isBlocked ? Math.floor(baseDamage * 0.25) : Math.floor(baseDamage * (this.playerData.power / 100));
                    scene.cpuHealth = Math.max(0, scene.cpuHealth - damage);
                    scene.applyHitEffect(scene.cpu, damage, true, 'projectile');
                    this.animations.setCPUAnimation('heavy', 200);
                    if (this.ui) this.ui.updateHealthBars();
                    
                    // Impact explosion effect
                    const impact = scene.add.circle(scene.cpu.x, scene.cpu.y - 40, 25, 0xffd700, 0.8);
                    scene.tweens.add({ 
                        targets: impact, 
                        alpha: 0, 
                        scale: 1.5, 
                        duration: 300, 
                        onComplete: () => impact.destroy() 
                    });
                    
                    // Impact text
                    const impactText = scene.add.text(640, 360, 'BATARANG!', {
                        fontFamily: 'Anybody', fontSize: '32px', color: '#ffd700', fontStyle: 'bold italic',
                        stroke: '#000000', strokeThickness: 3
                    }).setOrigin(0.5);
                    scene.tweens.add({ 
                        targets: impactText, 
                        alpha: 0, 
                        scale: 1.3, 
                        duration: 500, 
                        onComplete: () => impactText.destroy() 
                    });
                    
                    if (!isBlocked) {
                        scene.comboCount += 2;
                        if (scene.comboText) scene.comboText.setText(`BATARANG! ${scene.comboCount} HITS!`);
                        if (scene.comboText) scene.comboText.setAlpha(1);
                    }
                    
                    if (scene.cpuHealth <= 0) scene.endGame('player');
                } else {
                    // Miss
                    const missText = scene.add.text(640, 360, 'MISS!', {
                        fontFamily: 'Anybody', fontSize: '28px', color: '#ff003c', fontStyle: 'bold italic',
                        stroke: '#000000', strokeThickness: 3
                    }).setOrigin(0.5);
                    scene.tweens.add({ 
                        targets: missText, 
                        alpha: 0, 
                        scale: 1.5, 
                        duration: 500, 
                        onComplete: () => missText.destroy() 
                    });
                }
                
                // Clean up
                this.destroyObject(batarang);
                this.destroyObject(glow);
            }
        });
        
        scene.time.delayedCall(400, () => {
            scene.hasSuperArmor = false;
            this.attackState = null;
        });
    });
}

// ========== WOLVERINE'S BERSERKER BARRAGE SPECIAL ==========
berserkerBarrage() {
    const scene = this.scene;
    if (!scene.roundActive || scene.isAttacking || scene.isSuperFrozen || scene.isJumping) return;
    if (scene.specialCooldown > 0) return;
    
    console.log('Wolverine special started!');
    
    scene.specialCooldown = 280;
    scene.hasSuperArmor = true;
    this.attackState = { type: 'special', active: true };
    
    // ========== Berserker Barrage - Rapid claw slashes ==========
    this.animations.setPlayerAnimation('special', 300, false, true);
    
    // Screen shake and flash
    scene.cameras.main.shake(150, 0.02);
    const whiteFlash = scene.add.rectangle(640, 360, 1280, 720, 0xffffff, 0);
    scene.tweens.add({ targets: whiteFlash, alpha: 0.3, duration: 50, yoyo: true, onComplete: () => whiteFlash.destroy() });
    
    // Check if in range
    const distance = Math.abs(scene.player.x - scene.cpu.x);
    const canHit = distance < 100;
    
    if (canHit) {
        const isBlocked = scene.cpuBlocking;
        const baseDamage = 25;
        const damage = isBlocked ? Math.floor(baseDamage * 0.25) : Math.floor(baseDamage * (this.playerData.power / 100));
        
        scene.cpuHealth = Math.max(0, scene.cpuHealth - damage);
        scene.applyHitEffect(scene.cpu, damage, true, 'claw');
        this.animations.setCPUAnimation('heavy', 200);
        if (this.ui) this.ui.updateHealthBars();
        
        // Claw slash effects
        for (let i = 0; i < 3; i++) {
            const slashX = scene.cpu.x - 30 + (i * 30);
            const slashY = scene.cpu.y - 30 + (i * 10);
            const slash = scene.add.circle(slashX, slashY, 15, 0xff8c00, 0.6);
            scene.tweens.add({ 
                targets: slash, 
                alpha: 0, 
                scale: 2, 
                duration: 200, 
                delay: i * 80,
                onComplete: () => slash.destroy() 
            });
        }
        
        // Blood/impact effect
        const impact = scene.add.circle(scene.cpu.x, scene.cpu.y - 40, 20, 0xff003c, 0.7);
        scene.tweens.add({ 
            targets: impact, 
            alpha: 0, 
            scale: 2, 
            duration: 300, 
            onComplete: () => impact.destroy() 
        });
        
        const specialText = scene.add.text(640, 300, 'BERSERKER BARRAGE!', {
            fontFamily: 'Anybody', fontSize: '36px', color: '#ff8c00', fontStyle: 'bold italic',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);
        scene.tweens.add({ 
            targets: specialText, 
            alpha: 0, 
            scale: 1.3, 
            duration: 600, 
            onComplete: () => specialText.destroy() 
        });
        
        scene.comboCount += 3;
        if (scene.comboText) scene.comboText.setText(`BERSERKER! ${scene.comboCount} HITS!`);
        if (scene.comboText) scene.comboText.setAlpha(1);
        
        if (scene.cpuHealth <= 0) scene.endGame('player');
    } else {
        const missText = scene.add.text(640, 360, 'MISS!', {
            fontFamily: 'Anybody', fontSize: '28px', color: '#ff003c', fontStyle: 'bold italic',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);
        scene.tweens.add({ 
            targets: missText, 
            alpha: 0, 
            scale: 1.5, 
            duration: 500, 
            onComplete: () => missText.destroy() 
        });
    }
    
    scene.time.delayedCall(500, () => {
        scene.hasSuperArmor = false;
        this.attackState = null;
    });
}
    
    // ========== MAIN SPECIAL DISPATCHER ==========
playerSpecialAttack() {
    if (this.playerData.name === 'ASHMIN') {
        this.goldenDragonFist();
    } else if (this.playerData.name === 'ADARSHA') {
        this.adarshaSpecial();
    } else if (this.playerData.name === 'ALPINE') {
        this.alpineSpecial();
    } else if (this.playerData.name === 'IRONMAN') {
        this.ironmanSpecial();
    } else if (this.playerData.name === 'BATMAN') {
        this.batmanSpecial();
    } else if (this.playerData.name === 'WOLVERINE') {
        this.berserkerBarrage();
    } else {
        this.standardSpecial();
    }
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