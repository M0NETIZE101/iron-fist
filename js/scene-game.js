/**
 * SCENE - Main Fighting Game Scene
 */

class FightingGame extends Phaser.Scene {
    constructor() {
        super({ key: 'FightingGame' });
        this.resetGameState();
    }
    
    resetGameState() {
        this.isAttacking = false;
        this.isBlocking = false;
        this.currentAnim = 'idle';
        this.comboCount = 0;
        this.comboTimer = 0;
        this.superMeter = 0;
        this.specialCooldown = 0;
        this.animationTimer = null;
        this.cpuAnimationTimer = null;
        this.cpuAttacking = false;
        this.cpuHitStun = 0;
        this.cpuBlocking = false;
        this.cpuBlockDecision = false;
        this.cpuSpecialCooldown = 0;
        this.cpuSuperMeter = 0;
        this.isSuperFrozen = false;
        this.superFreezeTimer = 0;
        this.playerHealth = 100;
        this.cpuHealth = 100;
        this.roundActive = true;
        this.roundTimer = 99;
        this.superFlashEffect = null;
        this.hasSuperArmor = false;
        
        // Jump physics
        this.isJumping = false;
        this.playerYVelocity = 0;
        
        // Mobile controls
        this.mobileLeftPressed = false;
        this.mobileRightPressed = false;
        this.mobileBlockPressed = false;
        this.mobileJumpRequested = false;
        
        // Block height tracking
        this.playerBlockHeight = 'mid';
        this.cpuBlockHeight = 'mid';
        
        // Position bounds
        this.playerX = 400;
        this.cpuX = 900;
        
        // Arena and fighter data (will be set in create)
        this.playerData = null;
        this.cpuData = null;
        this.cpuPersonality = null;
        this.cpuSettings = null;
        this.animations = null;
        this.ui = null;
        this.playerAttacks = null;
        this.cpuAttacks = null;
    }
    
    init(data) {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.playerFighter = urlParams.get('fighter') || 'ADARSHA';
        this.arenaParam = urlParams.get('arena') || 'NEO-TOKYO';
        this.difficulty = urlParams.get('difficulty') || 'medium';
        
        document.getElementById('arenaNameText').innerText = this.arenaParam;
        document.getElementById('difficultyText').innerText = this.difficulty.toUpperCase();
        
        this.cpuSettings = difficultySettings[this.difficulty] || difficultySettings.medium;
        
        // Set player data
        this.playerData = FIGHTERS[this.playerFighter] || FIGHTERS['ADARSHA'];
        
        // Set random CPU opponent
        const allFighters = Object.keys(FIGHTERS);
        const availableCPUs = allFighters.filter(f => f !== this.playerFighter);
        const randomCPU = availableCPUs[Math.floor(Math.random() * availableCPUs.length)];
        this.cpuData = FIGHTERS[randomCPU];
        this.cpuPersonality = this.cpuData.personality;
    }
    
    create() {
        this.resetGameState();
        
        // Background
        if (this.textures.exists('arenaBg')) {
            const bg = this.add.image(640, 360, 'arenaBg');
            bg.setDisplaySize(1280, 720);
            bg.setDepth(0);
        } else {
            const bg = this.add.graphics();
            bg.fillStyle(0x0a0a0a, 1);
            bg.fillRect(0, 0, 1280, 720);
            bg.setDepth(0);
        }
        
        // Ground shadow
        const ground = this.add.rectangle(640, 580, 1280, 140, 0x000000);
        ground.setAlpha(0.4);
        ground.setDepth(1);
        
        // Player sprite
        this.player = this.add.sprite(400, GROUND_Y, `${this.playerData.folder}_idle`);
        this.player.setDisplaySize(180, 270);
        this.player.setDepth(10);
        
        this.playerAura = this.add.ellipse(400, 500, 140, 180, this.playerData.color);
        this.playerAura.setAlpha(0.15);
        this.playerAura.setDepth(5);
        
        // CPU sprite
        this.cpu = this.add.sprite(900, GROUND_Y, `${this.cpuData.folder}_idle`);
        this.cpu.setDisplaySize(180, 270);
        this.cpu.setDepth(10);
        
        this.cpuAura = this.add.ellipse(900, 500, 140, 180, this.cpuData.color);
        this.cpuAura.setAlpha(0.15);
        this.cpuAura.setDepth(5);
        
        // Initialize modules
        this.animations = new Animations(this, this.playerData, this.cpuData);
        this.ui = new UI(this, this.playerData, this.cpuData);
        this.playerAttacks = new PlayerAttacks(this, this.animations, this.ui);
        this.cpuAttacks = new CPUAttacks(this, this.animations, this.cpuSettings, this.cpuPersonality);
        
        // UI Elements
        this.ui.createHealthBars();
        this.ui.createSuperMeters();
        
        // Combo text
        this.comboText = this.add.text(640, 160, '', { 
            fontFamily: 'Anybody', fontSize: '28px', color: '#ffd700', fontStyle: 'bold italic',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);
        this.comboText.setAlpha(0);
        this.comboText.setDepth(30);
        
        // Timer
        const timerBg = this.add.rectangle(640, 40, 100, 36, 0x000000);
        timerBg.setStrokeStyle(2, 0xff5252);
        timerBg.setDepth(19);
        
        this.timerText = this.add.text(640, 40, '99', { 
            fontFamily: 'JetBrains Mono', fontSize: '22px', color: '#ffb3b2', fontWeight: 'bold'
        }).setOrigin(0.5).setDepth(20);
        
        this.add.text(640, 62, 'SECONDS', { 
            fontFamily: 'JetBrains Mono', fontSize: '7px', color: '#666666', letterSpacing: '2px'
        }).setOrigin(0.5).setDepth(20);
        
        // VS Text
        const vsText = this.add.text(640, 320, 'VS', { 
            fontFamily: 'Anybody', fontSize: '120px', color: '#ffffff', fontStyle: 'italic', 
            fontWeight: '900', stroke: '#ffb3b2', strokeThickness: 4
        }).setOrigin(0.5);
        vsText.setAlpha(0.3);
        vsText.setAngle(-5);
        vsText.setDepth(25);
        this.tweens.add({ targets: vsText, alpha: 0, duration: 1000, delay: 1500, onComplete: () => vsText.destroy() });
        
        // Input keys
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.keyG = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
        this.keyH = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
        this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Timers
        this.setupGameTimers();
        
        // Effects
        this.impactFlash = this.add.rectangle(640, 360, 1280, 720, 0xffffff);
        this.impactFlash.setAlpha(0);
        this.impactFlash.setDepth(100);
        
        // Floating animation
        this.tweens.add({ targets: this.player, y: this.player.y - 3, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.tweens.add({ targets: this.cpu, y: this.cpu.y - 3, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        
        // Set global reference for mobile controls
        window.gameSceneRef = this;
    }
    
    setupGameTimers() {
        // Round timer
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (this.roundActive && this.roundTimer > 0 && !this.isSuperFrozen) {
                    this.roundTimer--;
                    this.timerText.setText(this.roundTimer.toString().padStart(2, '0'));
                    if (this.roundTimer <= 10) this.timerText.setColor('#ff003c');
                    if (this.roundTimer === 0) this.endGameByTimeout();
                }
            },
            loop: true
        });
        
        // Player Super meter build
        this.time.addEvent({
            delay: 100,
            callback: () => {
                if (this.roundActive && this.superMeter < 100 && !this.isSuperFrozen) {
                    this.superMeter = Math.min(100, this.superMeter + 1);
                    this.ui.updateHealthBars();
                    const superStatus = document.getElementById('superStatus');
                    if (superStatus) {
                        if (this.superMeter >= 100) {
                            superStatus.style.opacity = '1';
                            superStatus.classList.add('super-pulse');
                        } else {
                            superStatus.style.opacity = '0';
                            superStatus.classList.remove('super-pulse');
                        }
                    }
                }
            },
            loop: true
        });
        
        // CPU Super meter build
        this.time.addEvent({
            delay: 100,
            callback: () => {
                if (this.roundActive && this.cpuSuperMeter < 100 && !this.isSuperFrozen) {
                    this.cpuSuperMeter = Math.min(100, this.cpuSuperMeter + 0.8);
                    this.ui.updateHealthBars();
                    const cpuSuperStatus = document.getElementById('cpuSuperStatus');
                    if (cpuSuperStatus) {
                        cpuSuperStatus.style.opacity = this.cpuSuperMeter >= 100 ? '1' : '0';
                    }
                }
            },
            loop: true
        });
        
        // Cooldowns
        this.time.addEvent({
            delay: 100,
            callback: () => {
                if (this.isSuperFrozen) return;
                if (this.comboTimer > 0) {
                    this.comboTimer--;
                    if (this.comboTimer === 0) {
                        this.comboCount = 0;
                        this.comboText.setAlpha(0);
                    }
                }
                if (this.specialCooldown > 0) this.specialCooldown--;
                if (this.cpuSpecialCooldown > 0) this.cpuSpecialCooldown--;
                if (this.cpuHitStun > 0) this.cpuHitStun--;
            },
            loop: true
        });
        
        // CPU decision timer
        this.time.addEvent({
            delay: this.cpuSettings.attackDelay,
            callback: () => {
                if (this.cpuAttacks) this.cpuAttacks.decide();
            },
            loop: true
        });
    }
    
    startSuperFreeze(durationMs = 200) {
        this.isSuperFrozen = true;
        this.time.timeScale = 0.05;
        this.time.delayedCall(durationMs, () => {
            this.time.timeScale = 1;
            this.isSuperFrozen = false;
        });
    }
    
    updateMobileMovement() {
        if (!this.player || !this.roundActive || this.isSuperFrozen) return;
        
        // Mobile movement
        if (this.mobileLeftPressed) this.player.x -= 7;
        if (this.mobileRightPressed) this.player.x += 7;
        
        // Mobile jump
        if (this.mobileJumpRequested && !this.isJumping && !this.isAttacking && this.roundActive && !this.isSuperFrozen) {
            this.isJumping = true;
            this.playerYVelocity = JUMP_VELOCITY;
            if (this.animations) this.animations.setPlayerAnimation('jump', 300);
            this.mobileJumpRequested = false;
        }
        
        // Reset jump request if round inactive
        if (!this.roundActive && this.mobileJumpRequested) {
            this.mobileJumpRequested = false;
        }
        
        // Mobile block
        if (this.mobileBlockPressed && !this.isAttacking && !this.isJumping) {
            this.isBlocking = true;
            if (this.playerAura) {
                this.playerAura.setAlpha(0.3);
                this.playerAura.setFillStyle(0x00dbe9);
            }
            this.playerBlockHeight = 'mid';
        } else if (!this.mobileBlockPressed && !this.keyG?.isDown) {
            this.isBlocking = false;
            if (this.playerAura) {
                this.playerAura.setAlpha(0.15);
                this.playerAura.setFillStyle(this.playerData?.color || 0xff5252);
            }
        }
    }
    
    update() {
        if (!this.roundActive || this.isSuperFrozen) return;
        
        // Apply mobile movement first
        this.updateMobileMovement();
        
        // Keyboard movement
        let move = 0;
        if (!this.mobileLeftPressed && !this.mobileRightPressed) {
            if (this.keyLeft.isDown && !this.isAttacking && !this.isJumping) move = -1;
            if (this.keyRight.isDown && !this.isAttacking && !this.isJumping) move = 1;
            if (move !== 0) this.player.x += move * 7;
        }
        
        // Keyboard jump
        if (!this.mobileJumpRequested && Phaser.Input.Keyboard.JustDown(this.keySpace) && !this.isJumping && !this.isAttacking && this.roundActive && !this.isSuperFrozen) {
            this.isJumping = true;
            this.playerYVelocity = JUMP_VELOCITY;
            if (this.animations) this.animations.setPlayerAnimation('jump', 300);
        }
        
        // Jump physics
        if (this.isJumping) {
            this.playerYVelocity += GRAVITY * (1/60);
            this.player.y += this.playerYVelocity * (1/60);
            
            if (this.player.y >= GROUND_Y) {
                this.player.y = GROUND_Y;
                this.isJumping = false;
                this.playerYVelocity = 0;
                if (this.animations) this.animations.setPlayerAnimation('idle', 100);
            }
        }
        
        // Boundaries
        this.player.x = Math.min(Math.max(this.player.x, MIN_X), MAX_X - 100);
        this.cpu.x = Math.min(Math.max(this.cpu.x, MIN_X + 100), MAX_X);
        
        // Prevent overlap
        if (Math.abs(this.player.x - this.cpu.x) < 90) {
            if (this.player.x < this.cpu.x) {
                this.player.x = this.cpu.x - 90;
            } else {
                this.cpu.x = this.player.x + 90;
            }
        }
        
        // Facing direction
        const playerFacing = getFacingDirection(this.player.x, this.cpu.x, 'player');
        const cpuFacing = getFacingDirection(this.player.x, this.cpu.x, 'cpu');
        
        this.player.setFlipX(playerFacing === 'left');
        this.cpu.setFlipX(cpuFacing === 'left');
        
        // Attack inputs
        if (Phaser.Input.Keyboard.JustDown(this.keyA) && this.playerAttacks) this.playerAttacks.lightAttack();
        if (Phaser.Input.Keyboard.JustDown(this.keyS) && this.playerAttacks) this.playerAttacks.mediumAttack();
        if (Phaser.Input.Keyboard.JustDown(this.keyD) && this.playerAttacks) this.playerAttacks.heavyAttack();
        if (Phaser.Input.Keyboard.JustDown(this.keyF) && this.playerAttacks) {
            if (this.playerData.name === 'ASHMIN') {
                this.playerAttacks.goldenDragonFist();
            } else {
                this.playerAttacks.standardSpecial();
            }
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyH) && this.playerAttacks && this.superMeter >= 100) this.playerAttacks.superMove();
        
        // Keyboard block
        this.isBlocking = this.keyG.isDown && !this.isAttacking && !this.isJumping;
        if (this.isBlocking && !this.mobileBlockPressed) {
            this.playerAura.setAlpha(0.3);
            this.playerAura.setFillStyle(0x00dbe9);
            this.playerBlockHeight = 'mid';
        } else if (!this.isBlocking && !this.mobileBlockPressed) {
            this.playerAura.setAlpha(0.15);
            this.playerAura.setFillStyle(this.playerData.color);
        }
        
        // Aura positions
        this.playerAura.setPosition(this.player.x, this.player.y + 10);
        this.cpuAura.setPosition(this.cpu.x, this.cpu.y + 10);
    }
    
    applyHitEffect(target, damage, isHeavy) {
        this.cameras.main.shake(isHeavy ? 120 : 80, 0.008);
        
        if (target === this.cpu) {
            if (this.animations) this.animations.setCPUAnimation('hurt', 150);
        } else {
            if (this.animations) this.animations.setPlayerAnimation('hurt', 150);
        }
        
        target.setAlpha(0.5);
        this.time.delayedCall(100, () => target.setAlpha(1));
        
        const dmgText = this.add.text(target.x, target.y - 50, `${damage}`, {
            fontFamily: 'JetBrains Mono', fontSize: isHeavy ? '32px' : '24px',
            color: isHeavy ? '#ff003c' : '#ffb3b2', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5);
        dmgText.setDepth(50);
        this.tweens.add({ targets: dmgText, y: dmgText.y - 60, alpha: 0, scale: 1.3, duration: 500, onComplete: () => dmgText.destroy() });
        
        if (target === this.cpu) {
            target.x += isHeavy ? 40 : 25;
        } else {
            target.x -= isHeavy ? 40 : 25;
        }
        
        if (isHeavy) {
            this.tweens.add({ targets: this.impactFlash, alpha: 0.4, duration: 100, yoyo: true });
        }
    }
    
    endGameByTimeout() {
        if (this.playerHealth > this.cpuHealth) {
            this.endGame('player');
        } else if (this.cpuHealth > this.playerHealth) {
            this.endGame('cpu');
        } else {
            this.endGame('draw');
        }
    }
    
    endGame(winner) {
        this.roundActive = false;
        this.time.timeScale = 1;
        this.hasSuperArmor = false;
        
        let resultText;
        let resultColor;
        
        if (winner === 'player') {
            const isPerfect = this.playerHealth === 100;
            resultText = isPerfect ? `PERFECT! ${this.playerData.name} VICTORY!` : `${this.playerData.name} VICTORY!`;
            resultColor = '#ffb3b2';
            if (this.animations) this.animations.setPlayerAnimation('victory', 300);
        } else if (winner === 'cpu') {
            resultText = `${this.cpuData.name} VICTORY!`;
            resultColor = '#00dbe9';
            if (this.animations) this.animations.setCPUAnimation('victory', 300);
        } else {
            resultText = 'DRAW GAME!';
            resultColor = '#ffffff';
        }
        
        const announcement = this.add.text(640, 360, resultText, {
            fontFamily: 'Anybody', fontSize: '52px', color: resultColor,
            fontStyle: 'bold italic', letterSpacing: '4px',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);
        announcement.setAlpha(0);
        announcement.setScale(0.8);
        announcement.setDepth(200);
        
        this.tweens.add({ targets: announcement, alpha: 1, scale: 1, duration: 600, ease: 'Back.Out' });
        
        this.time.delayedCall(4000, () => {
            window.location.href = `difficulty.html?fighter=${encodeURIComponent(this.playerFighter)}&arena=${encodeURIComponent(this.arenaParam)}`;
        });
    }
}