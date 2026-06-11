/**
 * UI - Health Bars, Super Meters, Combo Display
 * Uses constants from config.js for responsive positioning
 */

class FightingUI {
    constructor(scene, playerData, cpuData) {
        this.scene = scene;
        this.playerData = playerData;
        this.cpuData = cpuData;
        this.isReady = false;
    }
    
    createHealthBars() {
        const scene = this.scene;
        
        // PLAYER HEALTH BAR (using UI constants from config)
        const playerBarBg = scene.add.rectangle(
            UI.PLAYER_HEALTH_X, UI.PLAYER_HEALTH_Y, 
            HEALTH_BAR_MAX_WIDTH, UI.PLAYER_HEALTH_BAR_HEIGHT, 0x1a1a1a
        );
        playerBarBg.setStrokeStyle(2, this.playerData.accent);
        playerBarBg.setOrigin(0, 0.5);
        playerBarBg.setDepth(20);
        
        scene.healthBarPlayer = scene.add.rectangle(
            UI.PLAYER_HEALTH_X, UI.PLAYER_HEALTH_Y, 
            HEALTH_BAR_MAX_WIDTH, UI.PLAYER_HEALTH_FILL_HEIGHT, this.playerData.color
        );
        scene.healthBarPlayer.setOrigin(0, 0.5);
        scene.healthBarPlayer.setDepth(21);
        
        // Player name plate
        const playerNameBg = scene.add.rectangle(
            UI.PLAYER_NAME_X, UI.PLAYER_NAME_Y, 
            UI.PLAYER_NAME_WIDTH, UI.PLAYER_NAME_HEIGHT, 0x000000
        );
        playerNameBg.setOrigin(0, 0.5);
        playerNameBg.setStrokeStyle(1, this.playerData.accent);
        playerNameBg.setDepth(20);
        scene.add.text(UI.PLAYER_NAME_X, UI.PLAYER_NAME_Y, this.playerData.name, { 
            fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#ffb3b2', letterSpacing: '2px', fontWeight: 'bold'
        }).setOrigin(0, 0.5).setDepth(21);
        
        scene.playerHealthText = scene.add.text(
            UI.PLAYER_HEALTH_TEXT_X, UI.PLAYER_HEALTH_TEXT_Y, '100%', { 
            fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#aaaaaa', fontWeight: 'bold'
        }).setOrigin(0, 0.5).setDepth(21);
        
        // CPU HEALTH BAR - Right-aligned
        const cpuBarBg = scene.add.rectangle(
            UI.CPU_HEALTH_X, UI.CPU_HEALTH_Y, 
            HEALTH_BAR_MAX_WIDTH, UI.CPU_HEALTH_BAR_HEIGHT, 0x1a1a1a
        );
        cpuBarBg.setStrokeStyle(2, this.cpuData.accent);
        cpuBarBg.setOrigin(1, 0.5);
        cpuBarBg.setDepth(20);
        
        scene.healthBarCPU = scene.add.rectangle(
            UI.CPU_HEALTH_X, UI.CPU_HEALTH_Y, 
            HEALTH_BAR_MAX_WIDTH, UI.CPU_HEALTH_FILL_HEIGHT, this.cpuData.color
        );
        scene.healthBarCPU.setOrigin(1, 0.5);
        scene.healthBarCPU.setDepth(21);
        
        // CPU name plate (right-aligned)
        const cpuNameBg = scene.add.rectangle(
            UI.CPU_NAME_X, UI.CPU_NAME_Y, 
            UI.CPU_NAME_WIDTH, UI.CPU_NAME_HEIGHT, 0x000000
        );
        cpuNameBg.setOrigin(1, 0.5);
        cpuNameBg.setStrokeStyle(1, this.cpuData.accent);
        cpuNameBg.setDepth(20);
        scene.add.text(UI.CPU_NAME_X, UI.CPU_NAME_Y, this.cpuData.name, { 
            fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#00dbe9', letterSpacing: '2px', fontWeight: 'bold'
        }).setOrigin(1, 0.5).setDepth(21);
        
        scene.cpuHealthText = scene.add.text(
            UI.CPU_HEALTH_TEXT_X, UI.CPU_HEALTH_TEXT_Y, '100%', { 
            fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#aaaaaa', fontWeight: 'bold'
        }).setOrigin(1, 0.5).setDepth(21);
        
        this.isReady = true;
    }
    
    createSuperMeters() {
        const scene = this.scene;
        
        // PLAYER SUPER METER
        const playerSuperBg = scene.add.rectangle(
            UI.PLAYER_SUPER_X, UI.PLAYER_SUPER_Y, 
            SUPER_BAR_MAX_WIDTH, UI.PLAYER_SUPER_HEIGHT, 0x1a1a1a
        );
        playerSuperBg.setOrigin(0, 0.5);
        playerSuperBg.setStrokeStyle(1, 0xffd700);
        playerSuperBg.setDepth(19);
        
        scene.superBar = scene.add.rectangle(
            UI.PLAYER_SUPER_X, UI.PLAYER_SUPER_Y, 
            0, UI.PLAYER_SUPER_FILL_HEIGHT, 0xffd700
        );
        scene.superBar.setOrigin(0, 0.5);
        scene.superBar.setDepth(20);
        
        scene.add.text(UI.PLAYER_SUPER_LABEL_X, UI.PLAYER_SUPER_LABEL_Y, 'SUPER METER', { 
            fontFamily: 'JetBrains Mono', fontSize: '7px', color: '#ffd700', letterSpacing: '3px', fontWeight: 'bold'
        }).setOrigin(0, 0.5).setDepth(20);
        
        scene.superText = scene.add.text(UI.PLAYER_SUPER_TEXT_X, UI.PLAYER_SUPER_TEXT_Y, '0%', { 
            fontFamily: 'JetBrains Mono', fontSize: '7px', color: '#888888'
        }).setOrigin(0, 0.5).setDepth(20);
        
        // CPU SUPER METER - Right-aligned
        const cpuSuperBg = scene.add.rectangle(
            UI.CPU_SUPER_X, UI.CPU_SUPER_Y, 
            SUPER_BAR_MAX_WIDTH, UI.CPU_SUPER_HEIGHT, 0x1a1a1a
        );
        cpuSuperBg.setOrigin(1, 0.5);
        cpuSuperBg.setStrokeStyle(1, 0xffd700);
        cpuSuperBg.setDepth(19);
        
        scene.cpuSuperBar = scene.add.rectangle(
            UI.CPU_SUPER_X, UI.CPU_SUPER_Y, 
            0, UI.CPU_SUPER_FILL_HEIGHT, 0xffd700
        );
        scene.cpuSuperBar.setOrigin(1, 0.5);
        scene.cpuSuperBar.setDepth(20);
        scene.cpuSuperBar.setAlpha(0.8);
        
        scene.add.text(UI.CPU_SUPER_LABEL_X, UI.CPU_SUPER_LABEL_Y, 'CPU SUPER', { 
            fontFamily: 'JetBrains Mono', fontSize: '7px', color: '#ffd700', letterSpacing: '2px', fontWeight: 'bold'
        }).setOrigin(1, 0.5).setDepth(20);
        
        scene.cpuSuperText = scene.add.text(UI.CPU_SUPER_TEXT_X, UI.CPU_SUPER_TEXT_Y, '0%', { 
            fontFamily: 'JetBrains Mono', fontSize: '7px', color: '#888888'
        }).setOrigin(1, 0.5).setDepth(20);
    }
    
    updateHealthBars() {
        // Don't update if UI not ready yet
        if (!this.isReady) return;
        
        const scene = this.scene;
        
        // Player health
        let playerWidth = HEALTH_BAR_MAX_WIDTH * (scene.playerHealth / 100);
        playerWidth = Math.min(Math.max(playerWidth, 0), HEALTH_BAR_MAX_WIDTH);
        if (scene.healthBarPlayer) scene.healthBarPlayer.width = playerWidth;
        
        // CPU health
        let cpuWidth = HEALTH_BAR_MAX_WIDTH * (scene.cpuHealth / 100);
        cpuWidth = Math.min(Math.max(cpuWidth, 0), HEALTH_BAR_MAX_WIDTH);
        if (scene.healthBarCPU) scene.healthBarCPU.width = cpuWidth;
        
        // Player super
        let superWidth = SUPER_BAR_MAX_WIDTH * (scene.superMeter / 100);
        superWidth = Math.min(Math.max(superWidth, 0), SUPER_BAR_MAX_WIDTH);
        if (scene.superBar) scene.superBar.width = superWidth;
        
        // CPU super
        let cpuSuperWidth = SUPER_BAR_MAX_WIDTH * (scene.cpuSuperMeter / 100);
        cpuSuperWidth = Math.min(Math.max(cpuSuperWidth, 0), SUPER_BAR_MAX_WIDTH);
        if (scene.cpuSuperBar) scene.cpuSuperBar.width = cpuSuperWidth;
        
        // Update text displays
        if (scene.playerHealthText) scene.playerHealthText.setText(`${Math.floor(scene.playerHealth)}%`);
        if (scene.cpuHealthText) scene.cpuHealthText.setText(`${Math.floor(scene.cpuHealth)}%`);
        if (scene.superText) scene.superText.setText(`${Math.floor(scene.superMeter)}%`);
        if (scene.cpuSuperText) scene.cpuSuperText.setText(`${Math.floor(scene.cpuSuperMeter)}%`);
        
        // Color change on low health
        if (scene.playerHealth < 25) {
            if (scene.healthBarPlayer) scene.healthBarPlayer.setFillStyle(0xff003c);
            if (scene.playerHealthText) scene.playerHealthText.setColor('#ff003c');
        } else {
            if (scene.healthBarPlayer) scene.healthBarPlayer.setFillStyle(this.playerData.color);
            if (scene.playerHealthText) scene.playerHealthText.setColor('#aaaaaa');
        }
        
        if (scene.cpuHealth < 25) {
            if (scene.healthBarCPU) scene.healthBarCPU.setFillStyle(0xff003c);
            if (scene.cpuHealthText) scene.cpuHealthText.setColor('#ff003c');
        } else {
            if (scene.healthBarCPU) scene.healthBarCPU.setFillStyle(this.cpuData.color);
            if (scene.cpuHealthText) scene.cpuHealthText.setColor('#aaaaaa');
        }
    }
    
    showCombo() {
        const scene = this.scene;
        if (!scene.comboText) return;
        
        scene.comboCount++;
        scene.comboTimer = 30;
        scene.comboText.setText(`${scene.comboCount} HIT COMBO!`);
        scene.comboText.setAlpha(1);
        scene.comboText.setScale(1.2);
        scene.tweens.add({ targets: scene.comboText, scale: 1, duration: 200 });
        
        scene.superMeter = Math.min(100, scene.superMeter + 5);
        this.updateHealthBars();
    }
}