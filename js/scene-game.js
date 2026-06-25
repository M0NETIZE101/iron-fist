/**
 * SCENE - Main Fighting Game Scene
 */

class FightingGame extends Phaser.Scene {
    constructor() {
        super({ key: 'FightingGame' });
        this.resetGameState();
        this.playerFloatTween = null;
        this.cpuFloatTween = null;
        this.gameMode = 'offline';
        this.playerRole = 'host';
        this.network = null;
        this.waitingText = null;
        this._lastInputState = null;
        this.isOnlineMatch = false;
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
        
        // DOUBLE JUMP STATE
        this.playerJumpsUsed = 0;
        this.playerDoubleJumpCooldown = 0;
        
        // CPU Jump physics
        this.cpuIsJumping = false;
        this.cpuYVelocity = 0;
        this.cpuJumpsUsed = 0;
        this.cpuDoubleJumpCooldown = 0;
        
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
        const mode = urlParams.get('mode') || 'offline';
        const role = urlParams.get('role') || 'host';
        
        // Check if this is an online match
        this.isOnlineMatch = mode === 'online';
        this.gameMode = mode;
        this.playerRole = role;
        
        console.log(`[Preload] Mode: ${this.gameMode}, Role: ${this.playerRole}`);
        
        // Set player data first
        this.playerData = FIGHTERS[playerFighter] || FIGHTERS['ADARSHA'];
        
        // ===== ONLY SET CPU OPPONENT FOR OFFLINE MODE =====
        if (!this.isOnlineMatch) {
            // Set CPU opponent for offline mode
            const allFighters = Object.keys(FIGHTERS);
            const availableCPUs = allFighters.filter(f => f !== playerFighter);
            const randomCPU = availableCPUs[Math.floor(Math.random() * availableCPUs.length)];
            this.cpuData = FIGHTERS[randomCPU];
            this.cpuSelected = randomCPU;
            console.log('[Preload] CPU selected (offline):', this.cpuData.name);
        } else {
            // In online mode, we'll get opponent info from network
            console.log('[Preload] Online mode - CPU will be replaced by network opponent');
            // Still need a placeholder cpuData for the UI and sprite creation
            // Use the opponent from URL param or default
            const opponentFighter = urlParams.get('opponent') || 'ASHMIN';
            this.cpuData = FIGHTERS[opponentFighter] || FIGHTERS['ASHMIN'];
            this.cpuSelected = opponentFighter;
            console.log('[Preload] Online opponent:', this.cpuData.name);
        }
        
        // Load arena background
        const bgImage = arenaBackgrounds[arenaParam] || arenaBackgrounds['NEO-TOKYO'];
        this.load.image('arenaBg', bgImage);
        
        // ===== LOAD ADARSHA SPRITES =====
        this.load.image(`adarsha_idle`, `assets/characters/adarsha/idle.png`);
        this.load.image(`adarsha_punch-left`, `assets/characters/adarsha/punch-left.png`);
        this.load.image(`adarsha_punch-right`, `assets/characters/adarsha/punch-right.png`);
        this.load.image(`adarsha_kick-left`, `assets/characters/adarsha/kick-left.png`);
        this.load.image(`adarsha_kick-right`, `assets/characters/adarsha/kick-right.png`);
        this.load.image(`adarsha_hurt-left`, `assets/characters/adarsha/hurt-left.png`);
        this.load.image(`adarsha_hurt-right`, `assets/characters/adarsha/hurt-right.png`);
        this.load.image(`adarsha_special`, `assets/characters/adarsha/kick.png`);
        this.load.image(`adarsha_victory`, `assets/characters/adarsha/idle.png`);
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
        this.load.image(`ashmin_kick-left`, `assets/characters/ashmin/kick-left.png`);
        this.load.image(`ashmin_kick-right`, `assets/characters/ashmin/kick-right.png`);
        this.load.image(`ashmin_hurt-left`, `assets/characters/ashmin/hurt-left.png`);
        this.load.image(`ashmin_hurt-right`, `assets/characters/ashmin/hurt-right.png`);
        this.load.image(`ashmin_special`, `assets/characters/ashmin/kick.png`);
        this.load.image(`ashmin_victory`, `assets/characters/ashmin/idle.png`);
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
        this.load.image(`alpine_hurt-left`, `assets/characters/alpine/hurt-left.png`);
        this.load.image(`alpine_hurt-right`, `assets/characters/alpine/hurt-right.png`);
        this.load.image(`alpine_special_drink`, `assets/characters/alpine/special_drink.png`);
        this.load.image(`alpine_special_powerup`, `assets/characters/alpine/special_powerup.png`);
        this.load.image(`alpine_special_attack`, `assets/characters/alpine/special_attack.png`);
        this.load.image(`alpine_victory`, `assets/characters/alpine/idle.png`);
        
        // Load PRESIDENT sprites
        this.load.image(`president_idle`, `assets/characters/president/idle.png`);
        this.load.image(`president_punch-left`, `assets/characters/president/punch-left.png`);
        this.load.image(`president_punch-right`, `assets/characters/president/punch-right.png`);
        this.load.image(`president_kick-left`, `assets/characters/president/kick-left.png`);
        this.load.image(`president_kick-right`, `assets/characters/president/kick-right.png`);
        this.load.image(`president_hurt-left`, `assets/characters/president/hurt-left.png`);
        this.load.image(`president_hurt-right`, `assets/characters/president/hurt-right.png`);
        this.load.image(`president_special`, `assets/characters/president/kick.png`);
        this.load.image(`president_victory`, `assets/characters/president/idle.png`);
        
        // Load IRONMAN sprites
        this.load.image(`ironman_idle`, `assets/characters/ironman/idle.png`);
        this.load.image(`ironman_punch-left`, `assets/characters/ironman/punch-left.png`);
        this.load.image(`ironman_punch-right`, `assets/characters/ironman/punch-right.png`);
        this.load.image(`ironman_kick-left`, `assets/characters/ironman/kick-left.png`);
        this.load.image(`ironman_kick-right`, `assets/characters/ironman/kick-right.png`);
        this.load.image(`ironman_hurt-left`, `assets/characters/ironman/hurt-left.png`);
        this.load.image(`ironman_hurt-right`, `assets/characters/ironman/hurt-right.png`);
        this.load.image(`ironman_special`, `assets/characters/ironman/kick-right.png`);
        this.load.image(`ironman_victory`, `assets/characters/ironman/victory.png`);
        this.load.image(`ironman_repulsor`, `assets/characters/ironman/repulsor.png`);
        
        // Load BATMAN sprites
        this.load.image(`batman_idle`, `assets/characters/batman/idle.png`);
        this.load.image(`batman_punch-left`, `assets/characters/batman/punch-left.png`);
        this.load.image(`batman_punch-right`, `assets/characters/batman/punch-right.png`);
        this.load.image(`batman_kick-left`, `assets/characters/batman/kick-left.png`);
        this.load.image(`batman_kick-right`, `assets/characters/batman/kick-right.png`);
        this.load.image(`batman_hurt-left`, `assets/characters/batman/hurt-left.png`);
        this.load.image(`batman_hurt-right`, `assets/characters/batman/hurt-right.png`);
        this.load.image(`batman_special`, `assets/characters/batman/special.png`);
        this.load.image(`batman_victory`, `assets/characters/batman/victory.png`);
        
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
        
        // Check if online mode
        const mode = urlParams.get('mode') || 'offline';
        this.gameMode = mode;
        this.playerRole = urlParams.get('role') || 'host';
        this.isOnlineMatch = mode === 'online';
        
        console.log(`[Create] Mode: ${this.gameMode}, Role: ${this.playerRole}`);
        
        // For online mode, cpuData is set in preload() from the opponent param
        // For offline mode, cpuData is set in preload() randomly
        this.cpuPersonality = this.cpuData.personality;
        
        debugLog('Player:', this.playerData.name);
        debugLog('CPU (opponent):', this.cpuData.name);
        
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
        
        // ===== ONLY CREATE CPU ATTACKS FOR OFFLINE MODE =====
        if (!this.isOnlineMatch) {
            this.cpuAttacks = new CPUAttacks(this, this.animations, this.cpuSettings, this.cpuPersonality);
            console.log('[Create] CPU Attacks initialized (offline mode)');
        } else {
            // In online mode, we don't need CPU attacks - the opponent is a real player
            this.cpuAttacks = null;
            console.log('[Create] CPU Attacks disabled (online mode)');
        }
        
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
        
        // Timers - only for offline mode
        if (!this.isOnlineMatch) {
            this.setupGameTimers();
        }
        
        // Effects
        this.impactFlash = this.add.rectangle(BASE_WIDTH / 2, BASE_HEIGHT / 2, BASE_WIDTH, BASE_HEIGHT, 0xffffff);
        this.impactFlash.setAlpha(0);
        this.impactFlash.setDepth(100);
        
        // Float tweens
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
        
        // ===== ONLINE MODE SETUP =====
        if (this.isOnlineMatch) {
            console.log('[Create] Setting up online mode...');
            
            // Don't start round until network is ready
            this.roundActive = false;
            
            // Show connecting overlay
            this.waitingText = this.add.text(640, 360, 'RECONNECTING TO OPPONENT...', {
                fontFamily: 'Anybody', fontSize: '28px', color: '#ffb3b2',
                fontStyle: 'bold italic', stroke: '#000000', strokeThickness: 3
            }).setOrigin(0.5).setDepth(300);
            
            // Initialize network
            this.network = new GameNetwork(this);
            this.network.connect();
        }
        
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
        
        // CPU decision timer - only in offline mode
        if (!this.isOnlineMatch && this.cpuAttacks) {
            this.time.addEvent({
                delay: this.cpuSettings.attackDelay,
                callback: () => {
                    if (this.cpuAttacks) this.cpuAttacks.decide();
                },
                loop: true
            });
        }
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
        
        // Mobile double jump handling - check if jump requested and conditions met
        if (this.mobileJumpRequested && this.roundActive && !this.isSuperFrozen) {
            if (!this.isJumping) {
                // Ground jump
                this.isJumping = true;
                this.playerYVelocity = JUMP_VELOCITY;
                this.playerJumpsUsed = 1;
                if (this.animations) this.animations.setPlayerAnimation('jump_regular', 300);
                this.mobileJumpRequested = false;
                if (this.playerFloatTween) this.playerFloatTween.pause();
            } else if (this.playerJumpsUsed < 2 && this.playerDoubleJumpCooldown <= 0 && !this.isAttacking) {
                // Double jump - air jump
                this.playerYVelocity = DOUBLE_JUMP_VELOCITY;
                this.playerJumpsUsed = 2;
                
                // Horizontal boost in direction of movement
                let boostDirection = 0;
                if (this.mobileLeftPressed) boostDirection = -1;
                else if (this.mobileRightPressed) boostDirection = 1;
                else {
                    // Fall back to facing direction
                    const facing = getFacingDirection(this.player.x, this.cpu.x, 'player');
                    boostDirection = facing === 'right' ? 1 : -1;
                }
                this.player.x += boostDirection * DOUBLE_JUMP_HORIZONTAL_BOOST;
                
                if (this.animations) this.animations.setPlayerAnimation('jump_regular', 300);
                this.mobileJumpRequested = false;
            }
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
    
    // ===== ONLINE NETWORK CALLBACKS =====
    onNetworkReady() {
        console.log('[Game] Network ready!');
        if (this.waitingText) {
            this.waitingText.destroy();
            this.waitingText = null;
        }
        
        // Don't start round until countdown finishes
        this.roundActive = false;
        
        let count = 3;
        const countdown = this.add.text(640, 360, `${count}`, {
            fontFamily: 'Anybody', fontSize: '120px', color: '#ffb3b2',
            fontStyle: 'bold italic', stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(300);
        
        const timer = this.time.addEvent({
            delay: 1000,
            repeat: 2,
            callback: () => {
                count--;
                if (count > 0) {
                    countdown.setText(`${count}`);
                } else {
                    countdown.setText('FIGHT!');
                    this.roundActive = true;
                }
            }
        });
        this.time.delayedCall(3500, () => countdown.destroy());
    }
    
    onNetworkDisconnected() {
        console.log('[Game] Network disconnected');
        this.roundActive = false;
        if (this.waitingText) {
            this.waitingText.destroy();
            this.waitingText = null;
        }
        
        const dcText = this.add.text(640, 360, 'OPPONENT DISCONNECTED', {
            fontFamily: 'Anybody', fontSize: '32px', color: '#ff003c',
            fontStyle: 'bold italic', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(300);
        
        this.time.delayedCall(3000, () => {
            if (this.network) {
                this.network.disconnect();
            }
            window.location.href = 'online.html';
        });
    }
    
    // ===== ONLINE MODE METHODS =====
    getLocalInputState() {
        // JustDown keys are true for exactly one frame, which is correct for 
        // single-press actions (attacks, super). The diff check in sendInput()
        // ensures the state change is sent and then cleared on the next frame.
        if (window.CONTROL_MODE === 'mobile') {
            return {
                left: this.mobileLeftPressed || false,
                right: this.mobileRightPressed || false,
                jump: this.mobileJumpRequested || false,
                light: false,
                medium: false,
                heavy: false,
                special: false,
                block: this.mobileBlockPressed || false,
                super: false
            };
        }
        return {
            left: this.keyLeft?.isDown || false,
            right: this.keyRight?.isDown || false,
            jump: Phaser.Input.Keyboard.JustDown(this.keySpace),
            light: Phaser.Input.Keyboard.JustDown(this.keyA),
            medium: Phaser.Input.Keyboard.JustDown(this.keyS),
            heavy: Phaser.Input.Keyboard.JustDown(this.keyD),
            special: Phaser.Input.Keyboard.JustDown(this.keyF),
            block: this.keyG?.isDown || false,
            super: Phaser.Input.Keyboard.JustDown(this.keyH)
        };
    }
    
    updateLocalPlayerInput() {
        // Movement
        let move = 0;
        if (!this.mobileLeftPressed && !this.mobileRightPressed) {
            if (this.keyLeft.isDown && !this.isAttacking && !this.isJumping) move = -1;
            if (this.keyRight.isDown && !this.isAttacking && !this.isJumping) move = 1;
            if (move !== 0) this.player.x += move * 7;
        }
        
        if (this.mobileLeftPressed) this.player.x -= 7;
        if (this.mobileRightPressed) this.player.x += 7;
        
        // Mobile jump
        if (this.mobileJumpRequested && !this.isJumping && !this.isAttacking && this.roundActive && !this.isSuperFrozen) {
            this.isJumping = true;
            this.playerYVelocity = JUMP_VELOCITY;
            this.playerJumpsUsed = 1;
            if (this.animations) this.animations.setPlayerAnimation('jump_regular', 300);
            this.mobileJumpRequested = false;
            if (this.playerFloatTween) this.playerFloatTween.pause();
        }
        
        // Keyboard jump
        if (!this.mobileJumpRequested && Phaser.Input.Keyboard.JustDown(this.keySpace) && !this.isJumping && !this.isAttacking && this.roundActive && !this.isSuperFrozen) {
            this.isJumping = true;
            this.playerYVelocity = JUMP_VELOCITY;
            this.playerJumpsUsed = 1;
            if (this.animations) this.animations.setPlayerAnimation('jump_regular', 300);
            if (this.playerFloatTween) this.playerFloatTween.pause();
        }
        
        // Keyboard double jump
        if (!this.mobileJumpRequested && Phaser.Input.Keyboard.JustDown(this.keySpace) && this.isJumping && this.playerJumpsUsed < 2 && this.playerDoubleJumpCooldown <= 0 && !this.isAttacking && this.roundActive && !this.isSuperFrozen) {
            this.playerYVelocity = DOUBLE_JUMP_VELOCITY;
            this.playerJumpsUsed = 2;
            let boostDirection = 0;
            if (this.keyLeft.isDown) boostDirection = -1;
            else if (this.keyRight.isDown) boostDirection = 1;
            else {
                const facing = getFacingDirection(this.player.x, this.cpu.x, 'player');
                boostDirection = facing === 'right' ? 1 : -1;
            }
            this.player.x += boostDirection * DOUBLE_JUMP_HORIZONTAL_BOOST;
            if (this.animations) this.animations.setPlayerAnimation('jump_regular', 300);
        }
        
        // Attacks
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
        
        // Blocking
        const isBlockInputPressed = this.keyG.isDown || this.mobileBlockPressed;
        this.isBlocking = isBlockInputPressed && !this.isAttacking && !this.isJumping;
        
        if (this.isBlocking) {
            if (this.playerAura) {
                this.playerAura.setAlpha(0.3);
                this.playerAura.setFillStyle(0x00dbe9);
            }
            this.playerBlockHeight = 'mid';
        } else {
            if (this.playerAura) {
                this.playerAura.setAlpha(0.15);
                this.playerAura.setFillStyle(this.playerData?.color || 0xff5252);
            }
        }
    }
    
    updateOnlineMode() {
        if (!this.network || !this.network.isConnected) return;
        
        // Tick cooldowns
        if (this.playerDoubleJumpCooldown > 0) {
            this.playerDoubleJumpCooldown = Math.max(0, this.playerDoubleJumpCooldown - 100);
        }
        if (this.cpuDoubleJumpCooldown > 0) {
            this.cpuDoubleJumpCooldown = Math.max(0, this.cpuDoubleJumpCooldown - 100);
        }
        
        if (this.network.isHost) {
            // ===== HOST: Run game simulation for both players =====            
            // Player 1 (host) — read local keyboard/mobile input
            this.updateLocalPlayerInput();
            
            // Player 2 (joiner) — read remote input state
            const remote = this.network.remoteInputState;
            if (remote.left) this.cpu.x = Math.max(this.cpu.x - 7, MIN_X + 50);
            if (remote.right) this.cpu.x = Math.min(this.cpu.x + 7, MAX_X - 50);
            if (remote.jump && !this.cpuIsJumping) {
                this.cpuIsJumping = true;
                this.cpuYVelocity = JUMP_VELOCITY;
                this.cpuJumpsUsed = 1;
                if (this.animations) this.animations.setCPUAnimation('jump_regular', 300);
                if (this.cpuFloatTween) this.cpuFloatTween.pause();
            }
            
            // Remote attacks (using CPU attack methods)
            if (remote.light && !this.cpuAttacking && !this.cpuHitStun) {
                this.cpuAttacks.lightAttack();
            }
            if (remote.medium && !this.cpuAttacking && !this.cpuHitStun) {
                this.cpuAttacks.mediumAttack();
            }
            if (remote.heavy && !this.cpuAttacking && !this.cpuHitStun) {
                this.cpuAttacks.heavyAttack();
            }
            if (remote.special && !this.cpuAttacking && !this.cpuHitStun && this.cpuSpecialCooldown === 0) {
                this.cpuAttacks.specialAttack();
            }
            if (remote.block && !this.cpuAttacking) {
                this.cpuBlocking = true;
                this.cpuBlockHeight = 'mid';
            } else {
                this.cpuBlocking = false;
            }
            if (remote.super && this.cpuSuperMeter >= 100 && !this.cpuAttacking) {
                this.cpuAttacks.superMove();
            }
            
            // Run physics (includes CPU jump physics, boundaries, overlap prevention)
            this.updateGamePhysics();
            
            // Send game state to joiner every frame
            this.network.sendGameState({
                playerX: this.player.x,
                playerY: this.player.y,
                cpuX: this.cpu.x,
                cpuY: this.cpu.y,
                playerHealth: this.playerHealth,
                cpuHealth: this.cpuHealth,
                playerAnim: this.currentAnim,
                isBlocking: this.isBlocking,
                cpuBlocking: this.cpuBlocking,
                superMeter: this.superMeter,
                cpuSuperMeter: this.cpuSuperMeter,
                comboCount: this.comboCount,
                playerYVelocity: this.playerYVelocity,
                cpuYVelocity: this.cpuYVelocity,
                isJumping: this.isJumping,
                cpuIsJumping: this.cpuIsJumping,
                cpuJumpsUsed: this.cpuJumpsUsed,
                playerJumpsUsed: this.playerJumpsUsed
            });
            
        } else {
            // ===== CLIENT: Send local input, receive state =====
            const inputState = this.getLocalInputState();
            this.network.sendInput(inputState);
            
            // Clear one-shot input flags after sending
            this.mobileJumpRequested = false;
        }
    }
    
    applyRemoteGameState(state) {
        // On the client's screen, swap perspective:
        // - Host's playerX/Y becomes the opponent (cpu)
        // - Host's cpuX/Y becomes the client's own fighter (player)
        this.cpu.x = state.playerX;
        this.cpu.y = state.playerY;
        this.player.x = state.cpuX;
        this.player.y = state.cpuY;
        
        // Health bars
        this.playerHealth = state.cpuHealth; // client's own health
        this.cpuHealth = state.playerHealth; // opponent's health
        
        // Super meters
        this.superMeter = state.cpuSuperMeter;
        this.cpuSuperMeter = state.superMeter;
        
        // Block states
        this.cpuBlocking = state.isBlocking;
        this.isBlocking = state.cpuBlocking;
        
        // Combo
        this.comboCount = state.comboCount || 0;
        
        // Jump states (for visual sync)
        if (state.isJumping !== undefined) {
            this.isJumping = state.isJumping;
            this.playerYVelocity = state.playerYVelocity || 0;
        }
        if (state.cpuIsJumping !== undefined) {
            this.cpuIsJumping = state.cpuIsJumping;
            this.cpuYVelocity = state.cpuYVelocity || 0;
        }
        
        // Update UI
        if (this.ui) this.ui.updateHealthBars();
        
        // Update combo text if active
        if (this.comboText && this.comboCount > 0) {
            this.comboText.setText(`${this.comboCount} HIT COMBO!`);
            this.comboText.setAlpha(1);
        }
    }
    
    applyRemoteEvent(event) {
        console.log('[Game] Remote event:', event);
        if (event.type === 'round_end') {
            // Show result on client
            const winner = event.winner;
            const resultText = winner === 'host' ? 'OPPONENT VICTORY!' : 'YOU WIN!';
            const resultColor = winner === 'host' ? '#ff003c' : '#4ade80';
            
            const announcement = this.add.text(BASE_WIDTH / 2, BASE_HEIGHT / 2, resultText, {
                fontFamily: 'Anybody', fontSize: '52px', color: resultColor,
                fontStyle: 'bold italic', letterSpacing: '4px',
                stroke: '#000000', strokeThickness: 4
            }).setOrigin(0.5);
            announcement.setAlpha(0);
            announcement.setScale(0.8);
            announcement.setDepth(200);
            
            this.tweens.add({ targets: announcement, alpha: 1, scale: 1, duration: 600, ease: 'Back.Out' });
            this.roundActive = false;
            
            this.time.delayedCall(4000, () => {
                if (this.network) {
                    this.network.disconnect();
                }
                window.location.href = 'online.html';
            });
        }
    }
    
    // ===== OVERRIDE endGame for online mode =====
    endGame(winner) {
        if (this.gameMode === 'online') {
            this.roundActive = false;
            this.time.timeScale = 1;
            this.hasSuperArmor = false;
            
            // Determine winner string for network
            let winnerStr = winner === 'player' ? 'host' : 'client';
            
            // Send game event to opponent
            if (this.network && this.network.isConnected) {
                this.network.sendGameEvent({
                    type: 'round_end',
                    winner: winnerStr
                });
            }
            
            // Show local result
            const resultText = winner === 'player' ? 'YOU WIN!' : 'OPPONENT VICTORY!';
            const resultColor = winner === 'player' ? '#4ade80' : '#ff003c';
            
            const announcement = this.add.text(BASE_WIDTH / 2, BASE_HEIGHT / 2, resultText, {
                fontFamily: 'Anybody', fontSize: '52px', color: resultColor,
                fontStyle: 'bold italic', letterSpacing: '4px',
                stroke: '#000000', strokeThickness: 4
            }).setOrigin(0.5);
            announcement.setAlpha(0);
            announcement.setScale(0.8);
            announcement.setDepth(200);
            
            this.tweens.add({ targets: announcement, alpha: 1, scale: 1, duration: 600, ease: 'Back.Out' });
            
            this.time.delayedCall(4000, () => {
                if (this.network) {
                    this.network.disconnect();
                }
                window.location.href = 'online.html';
            });
            
            if (this.playerAttacks) this.playerAttacks.clearCreatedObjects();
            return;
        }
        
        // If not online, use original endGame logic
        super.endGame(winner);
    }
    
    // Shared physics/boundary update logic - used by both PC and mobile
    updateGamePhysics() {
        if (!this.player || !this.cpu) return;
        
        // Player boundary clamping
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
        
        // Aura positions
        if (this.playerAura) this.playerAura.setPosition(this.player.x, this.player.y + UI.AURA_Y_OFFSET);
        if (this.cpuAura) this.cpuAura.setPosition(this.cpu.x, this.cpu.y + UI.AURA_Y_OFFSET);
        
        // Player jump physics
        if (this.isJumping) {
            this.playerYVelocity += GRAVITY * (1/60);
            this.player.y += this.playerYVelocity * (1/60);
            if (this.player.y >= GROUND_Y) {
                this.player.y = GROUND_Y;
                this.isJumping = false;
                this.playerYVelocity = 0;
                if (this.playerJumpsUsed === 2) {
                    this.playerDoubleJumpCooldown = DOUBLE_JUMP_COOLDOWN_MS;
                }
                this.playerJumpsUsed = 0;
                if (this.animations) this.animations.setPlayerAnimation('idle', 100);
                if (this.playerFloatTween) this.playerFloatTween.resume();
            }
        }
        
        // CPU jump physics - ONLY run if NOT in online host mode
        // (In online mode, CPU jumps are handled by remote input in updateOnlineMode)
        if (this.gameMode !== 'online' || !this.network?.isHost) {
            if (this.cpuIsJumping) {
                this.cpuYVelocity += GRAVITY * (1/60);
                this.cpu.y += this.cpuYVelocity * (1/60);
                if (this.cpu.y >= GROUND_Y) {
                    this.cpu.y = GROUND_Y;
                    this.cpuIsJumping = false;
                    this.cpuYVelocity = 0;
                    if (this.cpuJumpsUsed === 2) {
                        this.cpuDoubleJumpCooldown = DOUBLE_JUMP_COOLDOWN_MS;
                    }
                    this.cpuJumpsUsed = 0;
                    if (this.animations) this.animations.setCPUAnimation('idle', 100);
                    if (this.cpuFloatTween) this.cpuFloatTween.resume();
                } else {
                    if (this.cpuFloatTween) this.cpuFloatTween.pause();
                }
            }
        }
        
        // CPU launch physics (attack-launch system)
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
    }
    
    update(time, delta) {
        const cappedDelta = this.batterySaveMode ? Math.min(delta, 33) : delta;
        
        // ===== ONLINE MODE BRANCH =====
        if (this.gameMode === 'online') {
            if (!this.roundActive || this.isSuperFrozen) return;
            this.updateOnlineMode();
            return; // Skip rest of offline update
        }
        
        // ===== OFFLINE MODE: Original update logic =====
        if (!this.roundActive || this.isSuperFrozen) return;
        
        // Tick down double jump cooldowns (matching specialCooldown style)
        if (this.playerDoubleJumpCooldown > 0) {
            this.playerDoubleJumpCooldown = Math.max(0, this.playerDoubleJumpCooldown - 100);
        }
        if (this.cpuDoubleJumpCooldown > 0) {
            this.cpuDoubleJumpCooldown = Math.max(0, this.cpuDoubleJumpCooldown - 100);
        }
        
        this.updateMobileMovement();
        
        let move = 0;
        if (!this.mobileLeftPressed && !this.mobileRightPressed) {
            if (this.keyLeft.isDown && !this.isAttacking && !this.isJumping) move = -1;
            if (this.keyRight.isDown && !this.isAttacking && !this.isJumping) move = 1;
            if (move !== 0) this.player.x += move * 7;
        }
        
        // Keyboard jump - with double jump support
        if (!this.mobileJumpRequested && Phaser.Input.Keyboard.JustDown(this.keySpace) && this.roundActive && !this.isSuperFrozen) {
            if (!this.isJumping && !this.isAttacking) {
                // Ground jump
                this.isJumping = true;
                this.playerYVelocity = JUMP_VELOCITY;
                this.playerJumpsUsed = 1;
                if (this.animations) this.animations.setPlayerAnimation('jump_regular', 300);
                if (this.playerFloatTween) this.playerFloatTween.pause();
            } else if (this.isJumping && this.playerJumpsUsed < 2 && this.playerDoubleJumpCooldown <= 0 && !this.isAttacking) {
                // Double jump - air jump
                this.playerYVelocity = DOUBLE_JUMP_VELOCITY;
                this.playerJumpsUsed = 2;
                
                // Horizontal boost in direction of movement
                let boostDirection = 0;
                if (this.keyLeft.isDown) boostDirection = -1;
                else if (this.keyRight.isDown) boostDirection = 1;
                else {
                    // Fall back to facing direction
                    const facing = getFacingDirection(this.player.x, this.cpu.x, 'player');
                    boostDirection = facing === 'right' ? 1 : -1;
                }
                this.player.x += boostDirection * DOUBLE_JUMP_HORIZONTAL_BOOST;
                
                if (this.animations) this.animations.setPlayerAnimation('jump_regular', 300);
            }
        }
        
        // Player jump physics
        if (this.isJumping) {
            this.playerYVelocity += GRAVITY * (1/60);
            this.player.y += this.playerYVelocity * (1/60);
            
            if (this.player.y >= GROUND_Y) {
                this.player.y = GROUND_Y;
                this.isJumping = false;
                this.playerYVelocity = 0;
                
                // Reset jumps and set cooldown if double jump was used
                if (this.playerJumpsUsed === 2) {
                    this.playerDoubleJumpCooldown = DOUBLE_JUMP_COOLDOWN_MS;
                }
                this.playerJumpsUsed = 0;
                
                if (this.animations) this.animations.setPlayerAnimation('idle', 100);
                if (this.playerFloatTween) this.playerFloatTween.resume();
            }
        }
        
        // CPU jump physics
        if (this.cpuIsJumping) {
            this.cpuYVelocity += GRAVITY * (1/60);
            this.cpu.y += this.cpuYVelocity * (1/60);
            
            if (this.cpu.y >= GROUND_Y) {
                this.cpu.y = GROUND_Y;
                this.cpuIsJumping = false;
                this.cpuYVelocity = 0;
                if (this.cpuJumpsUsed === 2) {
                    this.cpuDoubleJumpCooldown = DOUBLE_JUMP_COOLDOWN_MS;
                }
                this.cpuJumpsUsed = 0;
                if (this.animations) this.animations.setCPUAnimation('idle', 100);
                if (this.cpuFloatTween) this.cpuFloatTween.resume();
            } else {
                if (this.cpuFloatTween) this.cpuFloatTween.pause();
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
}