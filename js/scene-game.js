/**
 * SCENE - Main Fighting Game Scene
 */

class FightingGame extends Phaser.Scene {
    constructor() {
        super({ key: 'FightingGame' });
        this.resetGameState();
        this.playerFloatTween = null;
        this.cpuFloatTween = null;
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
        
        // CPU launch state (for Adarsha's special)
        this.cpuLaunched = false;
        this.cpuLaunchVelocity = 0;
        
        // Mobile controls
        this.mobileLeftPressed = false;
        this.mobileRightPressed = false;
        this.mobileBlockPressed = false;
        this.mobileJumpRequested = false;
        
        // Block height tracking
        this.playerBlockHeight = 'mid';
        this.cpuBlockHeight = 'mid';
        
        // Arena and fighter data
        this.playerData = null;
        this.cpuData = null;
        this.cpuPersonality = null;
        this.cpuSettings = null;
        this.animations = null;
        this.ui = null;
        this.playerAttacks = null;
        this.cpuAttacks = null;
        
        // CPU selection storage
        this.cpuSelected = null;
        
        // Debug mode
        this.debugGraphics = null;
        this.keyO = null;
    }
    
    preload() {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const playerFighter = urlParams.get('fighter') || 'ADARSHA';
        const arenaParam = urlParams.get('arena') || 'NEO-TOKYO';
        
        // Set player data first
        this.playerData = FIGHTERS[playerFighter] || FIGHTERS['ADARSHA'];
        
        // Set CPU opponent ONCE here
        const allFighters = Object.keys(FIGHTERS);
        const availableCPUs = allFighters.filter(f => f !== playerFighter);
        const randomCPU = availableCPUs[Math.floor(Math.random() * availableCPUs.length)];
        this.cpuData = FIGHTERS[randomCPU];
        this.cpuSelected = randomCPU;
        
        debugLog('CPU selected in preload:', this.cpuData.name);
        
        // Load arena background
        const bgImage = arenaBackgrounds[arenaParam] || arenaBackgrounds['NEO-TOKYO'];
        this.load.image('arenaBg', bgImage);
        
        // Load ADARSHA sprites
        this.load.image(`adarsha_idle`, `assets/characters/adarsha/idle.png`);
        this.load.image(`adarsha_punch-left`, `assets/characters/adarsha/punch-left.png`);
        this.load.image(`adarsha_punch-right`, `assets/characters/adarsha/punch-right.png`);
        this.load.image(`adarsha_kick`, `assets/characters/adarsha/kick.png`);
        this.load.image(`adarsha_special`, `assets/characters/adarsha/kick.png`);
        this.load.image(`adarsha_victory`, `assets/characters/adarsha/idle.png`);
        this.load.image(`adarsha_hurt`, `assets/characters/adarsha/idle.png`);
        this.load.image(`adarsha_jumpstart`, `assets/characters/adarsha/jumpstart.png`);
        this.load.image(`adarsha_jump`, `assets/characters/adarsha/jump.png`);
        this.load.image(`adarsha_jumpkick`, `assets/characters/adarsha/jumpkick.png`);
        this.load.image(`adarsha_firestart`, `assets/characters/adarsha/firestart.png`);
        this.load.image(`adarsha_firing`, `assets/characters/adarsha/firing.png`);
        this.load.image(`adarsha_fireball`, `assets/characters/adarsha/fireball.png`);
        
        // Load ASHMIN sprites
        this.load.image(`ashmin_idle`, `assets/characters/ashmin/idle.png`);
        this.load.image(`ashmin_punch-left`, `assets/characters/ashmin/punch-left.png`);
        this.load.image(`ashmin_punch-right`, `assets/characters/ashmin/punch-right.png`);
        this.load.image(`ashmin_kick`, `assets/characters/ashmin/kick.png`);
        this.load.image(`ashmin_special`, `assets/characters/ashmin/kick.png`);
        this.load.image(`ashmin_victory`, `assets/characters/ashmin/idle.png`);
        this.load.image(`ashmin_hurt`, `assets/characters/ashmin/idle.png`);
        this.load.image(`ashmin_dragon_1`, `assets/characters/ashmin/dragon_frame1.png`);
        this.load.image(`ashmin_dragon_2`, `assets/characters/ashmin/dragon_frame2.png`);
        this.load.image(`ashmin_dragon_3`, `assets/characters/ashmin/dragon_frame3.png`);
        this.load.image(`ashmin_coin_explosion`, `assets/characters/ashmin/coin_explosion.png`);
        
        // Load ALPINE sprites
        this.load.image(`alpine_idle`, `assets/characters/alpine/idle.png`);
        this.load.image(`alpine_punch-left`, `assets/characters/alpine/punch-left.png`);
        this.load.image(`alpine_punch-right`, `assets/characters/alpine/punch-right.png`);
        this.load.image(`alpine_kick-left`, `assets/characters/alpine/kick-left.png`);
        this.load.image(`alpine_kick-right`, `assets/characters/alpine/kick-right.png`);
        this.load.image(`alpine_special_drink`, `assets/characters/alpine/special_drink.png`);
        this.load.image(`alpine_special_powerup`, `assets/characters/alpine/special_powerup.png`);
        this.load.image(`alpine_special_attack`, `assets/characters/alpine/special_attack.png`);
        this.load.image(`alpine_victory`, `assets/characters/alpine/idle.png`);
        this.load.image(`alpine_hurt`, `assets/characters/alpine/idle.png`);
        
        // Load PRESIDENT sprites
        this.load.image(`president_idle`, `assets/characters/president/idle.png`);
        this.load.image(`president_punch-left`, `assets/characters/president/punch-left.png`);
        this.load.image(`president_punch-right`, `assets/characters/president/punch-right.png`);
        this.load.image(`president_kick`, `assets/characters/president/kick.png`);
        this.load.image(`president_special`, `assets/characters/president/kick.png`);
        this.load.image(`president_victory`, `assets/characters/president/idle.png`);
        this.load.image(`president_hurt`, `assets/characters/president/idle.png`);
        
        // Load IRONMAN sprites
        this.load.image(`ironman_idle`, `assets/characters/ironman/idle.png`);
        this.load.image(`ironman_punch-left`, `assets/characters/ironman/punch-left.png`);
        this.load.image(`ironman_punch-right`, `assets/characters/ironman/punch-right.png`);
        this.load.image(`ironman_kick-left`, `assets/characters/ironman/kick-left.png`);
        this.load.image(`ironman_kick-right`, `assets/characters/ironman/kick-right.png`);
        this.load.image(`ironman_special`, `assets/characters/ironman/kick-right.png`);
        this.load.image(`ironman_victory`, `assets/characters/ironman/victory.png`);
        this.load.image(`ironman_hurt`, `assets/characters/ironman/hurt.png`);
        this.load.image(`ironman_repulsor`, `assets/characters/ironman/repulsor.png`);
        
        // Error handling
        this.load.on('loaderror', (file) => {
            debugLog('Failed to load:', file.src, 'Key:', file.key);
        });
        
        this.load.on('loadcomplete', () => {
            debugLog('All assets loaded successfully');
        });
    }
    
    create() {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const difficulty = urlParams.get('difficulty') || 'medium';
        
        this.cpuSettings = difficultySettings[difficulty] || difficultySettings.medium;
        
        // Set player data
        const playerFighter = urlParams.get('fighter') || 'ADARSHA';
        this.playerData = FIGHTERS[playerFighter] || FIGHTERS['ADARSHA'];
        
        // Use cpuData already set in preload()
        this.cpuPersonality = this.cpuData.personality;
        
        debugLog('Player:', this.playerData.name);
        debugLog('CPU (from preload):', this.cpuData.name);
        
        // Verify textures exist
        const playerIdleKey = `${this.playerData.folder}_idle`;
        const cpuIdleKey = `${this.cpuData.folder}_idle`;
        
        debugLog('Player idle texture exists?', this.textures.exists(playerIdleKey));
        debugLog('CPU idle texture exists?', this.textures.exists(cpuIdleKey));
        
        // Background - centered
        if (this.textures.exists('arenaBg')) {
            const bg = this.add.image(BASE_WIDTH / 2, BASE_HEIGHT / 2, 'arenaBg');
            bg.setDisplaySize(BASE_WIDTH, BASE_HEIGHT);
            bg.setDepth(0);
        } else {
            const bg = this.add.graphics();
            bg.fillStyle(0x0a0a0a, 1);
            bg.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
            bg.setDepth(0);
        }
        
        // Ground shadow
        const ground = this.add.rectangle(BASE_WIDTH / 2, GROUND_Y + 120, BASE_WIDTH, 140, 0x000000);
        ground.setAlpha(0.4);
        ground.setDepth(1);
        
        // Player sprite
        this.player = this.add.sprite(START_POSITIONS.PLAYER_X, START_POSITIONS.PLAYER_Y, playerIdleKey);
        this.player.setDisplaySize(CHARACTER_WIDTH, CHARACTER_HEIGHT);
        this.player.setDepth(10);
        this.player.setVisible(true);
        
        // Player aura
        this.playerAura = this.add.ellipse(
            START_POSITIONS.PLAYER_X, 
            START_POSITIONS.PLAYER_Y + UI.AURA_Y_OFFSET, 
            AURA_WIDTH, AURA_HEIGHT, 
            this.playerData.color
        );
        this.playerAura.setAlpha(0.15);
        this.playerAura.setDepth(5);
        
        // CPU sprite
        this.cpu = this.add.sprite(START_POSITIONS.CPU_X, START_POSITIONS.CPU_Y, cpuIdleKey);
        this.cpu.setDisplaySize(CHARACTER_WIDTH, CHARACTER_HEIGHT);
        this.cpu.setDepth(10);
        this.cpu.setVisible(true);
        
        // CPU aura
        this.cpuAura = this.add.ellipse(
            START_POSITIONS.CPU_X, 
            START_POSITIONS.CPU_Y + UI.AURA_Y_OFFSET, 
            AURA_WIDTH, AURA_HEIGHT, 
            this.cpuData.color
        );
        this.cpuAura.setAlpha(0.15);
        this.cpuAura.setDepth(5);
        
        // Initialize modules
        this.animations = new Animations(this, this.playerData, this.cpuData);
        this.ui = new FightingUI(this, this.playerData, this.cpuData);
        this.playerAttacks = new PlayerAttacks(this, this.animations, this.ui);
        this.cpuAttacks = new CPUAttacks(this, this.animations, this.cpuSettings, this.cpuPersonality);
        
        // UI Elements
        this.ui.createHealthBars();
        this.ui.createSuperMeters();
        
        // Combo text
        this.comboText = this.add.text(UI.COMBO_X, UI.COMBO_Y, '', { 
            fontFamily: 'Anybody', fontSize: '28px', color: '#ffd700', fontStyle: 'bold italic',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);
        this.comboText.setAlpha(0);
        this.comboText.setDepth(30);
        
        // Timer
        const timerBg = this.add.rectangle(UI.TIMER_X, UI.TIMER_Y, UI.TIMER_WIDTH, UI.TIMER_HEIGHT, 0x000000);
        timerBg.setStrokeStyle(2, 0xff5252);
        timerBg.setDepth(19);
        
        this.timerText = this.add.text(UI.TIMER_X, UI.TIMER_Y, '99', { 
            fontFamily: 'JetBrains Mono', fontSize: '22px', color: '#ffb3b2', fontWeight: 'bold'
        }).setOrigin(0.5).setDepth(20);
        
        this.add.text(UI.TIMER_X, UI.TIMER_Y + 22, 'SECONDS', { 
            fontFamily: 'JetBrains Mono', fontSize: '7px', color: '#666666', letterSpacing: '2px'
        }).setOrigin(0.5).setDepth(20);
        
        // VS Text
        const vsText = this.add.text(UI.VS_X, UI.VS_Y, 'VS', { 
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
        this.keyO = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O);
        
        // Debug graphics layer
        this.debugGraphics = this.add.graphics();
        this.debugGraphics.setDepth(200);
        
        // Timers
        this.setupGameTimers();
        
        // Effects
        this.impactFlash = this.add.rectangle(BASE_WIDTH / 2, BASE_HEIGHT / 2, BASE_WIDTH, BASE_HEIGHT, 0xffffff);
        this.impactFlash.setAlpha(0);
        this.impactFlash.setDepth(100);
        
        // FIXED: Store float tweens for pause/resume control
        this.playerFloatTween = this.tweens.add({ 
            targets: this.player, 
            y: this.player.y - 3, 
            duration: 1500, 
            yoyo: true, 
            repeat: -1, 
            ease: 'Sine.easeInOut' 
        });
        
        this.cpuFloatTween = this.tweens.add({ 
            targets: this.cpu, 
            y: this.cpu.y - 3, 
            duration: 1500, 
            yoyo: true, 
            repeat: -1, 
            ease: 'Sine.easeInOut' 
        });
        
        // Set global reference for mobile controls
        window.gameSceneRef = this;
        
        debugLog('Game created successfully!');
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
                    if (this.ui) this.ui.updateHealthBars();
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
                    if (this.ui) this.ui.updateHealthBars();
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
                        if (this.comboText) this.comboText.setAlpha(0);
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
        
        if (this.mobileLeftPressed) this.player.x -= 7;
        if (this.mobileRightPressed) this.player.x += 7;
        
        if (this.mobileJumpRequested && !this.isJumping && !this.isAttacking && this.roundActive && !this.isSuperFrozen) {
            this.isJumping = true;
            this.playerYVelocity = JUMP_VELOCITY;
            if (this.animations) this.animations.setPlayerAnimation('jump_regular', 300);
            this.mobileJumpRequested = false;
        }
        
        if (!this.roundActive && this.mobileJumpRequested) {
            this.mobileJumpRequested = false;
        }
        
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
        
        this.updateMobileMovement();
        
        let move = 0;
        if (!this.mobileLeftPressed && !this.mobileRightPressed) {
            if (this.keyLeft.isDown && !this.isAttacking && !this.isJumping) move = -1;
            if (this.keyRight.isDown && !this.isAttacking && !this.isJumping) move = 1;
            if (move !== 0) this.player.x += move * 7;
        }
        
        // Keyboard jump - FIXED: Pause float tween during jump
        if (!this.mobileJumpRequested && Phaser.Input.Keyboard.JustDown(this.keySpace) && !this.isJumping && !this.isAttacking && this.roundActive && !this.isSuperFrozen) {
            this.isJumping = true;
            this.playerYVelocity = JUMP_VELOCITY;
            if (this.animations) this.animations.setPlayerAnimation('jump_regular', 300);
            // Pause float tween while jumping
            if (this.playerFloatTween) this.playerFloatTween.pause();
        }
        
        // Player jump physics
        if (this.isJumping) {
            this.playerYVelocity += GRAVITY * (1/60);
            this.player.y += this.playerYVelocity * (1/60);
            
            if (this.player.y >= GROUND_Y) {
                this.player.y = GROUND_Y;
                this.isJumping = false;
                this.playerYVelocity = 0;
                if (this.animations) this.animations.setPlayerAnimation('idle', 100);
                // Resume float tween when landing
                if (this.playerFloatTween) this.playerFloatTween.resume();
            }
        }
        
        // CPU launch physics - FIXED: Pause CPU float tween during launch
        if (this.cpuLaunched) {
            if (this.cpuFloatTween) this.cpuFloatTween.pause();
            
            this.cpu.y += this.cpuLaunchVelocity * (1/60);
            this.cpuLaunchVelocity += GRAVITY * (1/60);
            
            if (this.cpu.y >= GROUND_Y) {
                this.cpu.y = GROUND_Y;
                this.cpuLaunched = false;
                this.cpuLaunchVelocity = 0;
                if (this.cpuFloatTween) this.cpuFloatTween.resume();
            }
        }
        
        // Boundaries
        this.player.x = Math.min(Math.max(this.player.x, MIN_X), MAX_X - CHARACTER_WIDTH);
        this.cpu.x = Math.min(Math.max(this.cpu.x, MIN_X + CHARACTER_WIDTH), MAX_X);
        
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
        if (Phaser.Input.Keyboard.JustDown(this.keyA) && this.playerAttacks && !this.playerAttacks.attackState?.active) {
            this.playerAttacks.lightAttack();
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyS) && this.playerAttacks && !this.playerAttacks.attackState?.active) {
            this.playerAttacks.mediumAttack();
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyD) && this.playerAttacks && !this.playerAttacks.attackState?.active) {
            this.playerAttacks.heavyAttack();
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyF) && this.playerAttacks && !this.playerAttacks.attackState?.active) {
            this.playerAttacks.playerSpecialAttack();
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyH) && this.playerAttacks && this.superMeter >= 100 && !this.playerAttacks.attackState?.active) {
            this.playerAttacks.superMove();
        }
        
        // Blocking logic - combine keyboard and mobile
        const isBlockInputPressed = this.keyG.isDown || this.mobileBlockPressed;
        this.isBlocking = isBlockInputPressed && !this.isAttacking && !this.isJumping;
        
        if (this.isBlocking) {
            this.playerAura.setAlpha(0.3);
            this.playerAura.setFillStyle(0x00dbe9);
            this.playerBlockHeight = 'mid';
        } else {
            this.playerAura.setAlpha(0.15);
            this.playerAura.setFillStyle(this.playerData.color);
        }
        
        // Aura positions
        this.playerAura.setPosition(this.player.x, this.player.y + UI.AURA_Y_OFFSET);
        this.cpuAura.setPosition(this.cpu.x, this.cpu.y + UI.AURA_Y_OFFSET);
        
        // Debug mode
        if (Phaser.Input.Keyboard.JustDown(this.keyO)) {
            toggleDebugMode();
        }
        
        if (window.DEBUG_HITBOXES && this.debugGraphics) {
            this.debugGraphics.clear();
            
            const playerHurtboxes = getHurtboxes('player', this.player.x, this.player.y, 'medium');
            for (const [part, box] of Object.entries(playerHurtboxes)) {
                drawHitbox(this.debugGraphics, box, box.color, true);
                this.debugGraphics.fillStyle(0xffffff, 1);
                this.debugGraphics.fillText(part, box.x + 5, box.y + 15);
            }
            
            const cpuDifficulty = this.cpuSettings?.name || 'medium';
            const cpuHurtboxes = getHurtboxes('cpu', this.cpu.x, this.cpu.y, cpuDifficulty);
            for (const [part, box] of Object.entries(cpuHurtboxes)) {
                drawHitbox(this.debugGraphics, box, box.color, true);
                this.debugGraphics.fillStyle(0xffffff, 1);
                this.debugGraphics.fillText(part, box.x + 5, box.y + 15);
            }
            
            if (this.playerAttacks && this.playerAttacks.attackState) {
                const facing = getFacingDirection(this.player.x, this.cpu.x, 'player');
                const attackHitbox = getAttackHitbox(this.player, this.playerAttacks.attackState.type, facing, this.player.x, this.player.y);
                if (attackHitbox) {
                    drawHitbox(this.debugGraphics, attackHitbox, 0xffaa00, true);
                    this.debugGraphics.fillStyle(0xffffff, 1);
                    this.debugGraphics.fillText('ATTACK', attackHitbox.x + 5, attackHitbox.y - 5);
                }
            }
        } else if (this.debugGraphics && !window.DEBUG_HITBOXES) {
            this.debugGraphics.clear();
        }
    }
    
    applyHitEffect(target, damage, isHeavy, bodyPart = 'body') {
        this.cameras.main.shake(isHeavy ? 120 : 80, 0.008);
        
        if (target === this.cpu) {
            if (this.animations) this.animations.setCPUAnimation('hurt', 150);
        } else {
            if (this.animations) this.animations.setPlayerAnimation('hurt', 150);
        }
        
        target.setAlpha(0.5);
        this.time.delayedCall(100, () => target.setAlpha(1));
        
        const partText = window.DEBUG_HITBOXES ? ` [${bodyPart.toUpperCase()}]` : '';
        const dmgText = this.add.text(target.x, target.y - 50, `${damage}${partText}`, {
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
        
        const announcement = this.add.text(BASE_WIDTH / 2, BASE_HEIGHT / 2, resultText, {
            fontFamily: 'Anybody', fontSize: '52px', color: resultColor,
            fontStyle: 'bold italic', letterSpacing: '4px',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);
        announcement.setAlpha(0);
        announcement.setScale(0.8);
        announcement.setDepth(200);
        
        this.tweens.add({ targets: announcement, alpha: 1, scale: 1, duration: 600, ease: 'Back.Out' });
        
        const urlParams = new URLSearchParams(window.location.search);
        const playerFighter = urlParams.get('fighter') || 'ADARSHA';
        const arenaParam = urlParams.get('arena') || 'NEO-TOKYO';
        
        this.time.delayedCall(4000, () => {
            window.location.href = `difficulty.html?fighter=${encodeURIComponent(playerFighter)}&arena=${encodeURIComponent(arenaParam)}`;
        });
        
        if (this.playerAttacks) this.playerAttacks.clearCreatedObjects();
    }
}