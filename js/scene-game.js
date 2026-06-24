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
    
    // ... rest of scene-game.js (update, updateMobileMovement, etc.) ...
    // The rest of the file remains the same as the previous version
    // with the online mode methods (onNetworkReady, onNetworkDisconnected,
    // getLocalInputState, updateLocalPlayerInput, updateOnlineMode,
    // applyRemoteGameState, applyRemoteEvent, updateGamePhysics)
}