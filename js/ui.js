/**
 * UI - Health Bars, Super Meters, Combo Display
 */

class UI {
    constructor(scene, playerData, cpuData) {
        this.scene = scene;
        this.playerData = playerData;
        this.cpuData = cpuData;
    }
    
    createHealthBars() {
        const scene = this.scene;
        
        // PLAYER HEALTH BAR
        const playerBarBg = scene.add.rectangle(200, 40, HEALTH_BAR_MAX_WIDTH, 24, 0x1a1a1a);
        playerBarBg.setStrokeStyle(2, this.playerData.accent);
        playerBarBg.setOrigin(0, 0.5);
        playerBarBg.setDepth(20);
        
        scene.healthBarPlayer = scene.add.rectangle(200, 40, HEALTH_BAR_MAX_WIDTH, 18, this.playerData.color);
        scene.healthBarPlayer.setOrigin(0, 0.5);
        scene.healthBarPlayer.setDepth(21);
        
        const playerNameBg = scene.add.rectangle(200, 20, 140, 20, 0x000000);
        playerNameBg.setOrigin(0, 0.5);
        playerNameBg.setStrokeStyle(1, this.playerData.accent);
        playerNameBg.setDepth(20);
        scene.add.text(200, 20, this.playerData.name, { 
            fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#ffb3b2', letterSpacing: '2px', fontWeight: 'bold'
        }).setOrigin(0, 0.5).setDepth(21);
        
        scene.playerHealthText = scene.add.text(200, 60, '100%', { 
            fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#aaaaaa', fontWeight: 'bold'
        }).setOrigin(0, 0.5).setDepth(21);
        
        // CPU HEALTH BAR - Right-aligned
        const cpuBarBg = scene.add.rectangle(1280, 40, HEALTH_BAR_MAX_WIDTH, 24, 0x1a1a1a);
        cpuBarBg.setStrokeStyle(2, this.cpuData.accent);
        cpuBarBg.setOrigin(1, 0.5);
        cpuBarBg.setDepth(20);
        
        scene.healthBarCPU = scene.add.rectangle(1280, 40, HEALTH_BAR_MAX_WIDTH, 18, this.cpuData.color);
        scene.healthBarCPU.setOrigin(1, 0.5);
        scene.healthBarCPU.setDepth(21);
        
        const cpuNameBg = scene.add.rectangle(1280, 20, 140, 20, 0x000000);
        cpuNameBg.setOrigin(1, 0.5);
        cpuNameBg.setStrokeStyle(1, this.cpuData.accent);
        cpuNameBg.setDepth(20);
        scene.add.text(1280, 20, this.cpuData.name, { 
            fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#00dbe9', letterSpacing: '2px', fontWeight: 'bold'
        }).setOrigin(1, 0.5).setDepth(21);
        
        scene.cpuHealthText = scene.add.text(1280, 60, '100%', { 
            fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#aaaaaa', fontWeight: 'bold'
        }).setOrigin(1, 0.5).setDepth(21);
    }
    
    createSuperMeters() {
        const scene = this.scene;
        
        // PLAYER SUPER METER
        const playerSuperBg = scene.add.rectangle(200, 85, SUPER_BAR_MAX_WIDTH, 12, 0x1a1a1a);
        playerSuperBg.setOrigin(0, 0.5);
        playerSuperBg.setStrokeStyle(1, 0xffd700);
        playerSuperBg.setDepth(19);
        
        scene.superBar = scene.add.rectangle(200, 85, 0, 8, 0xffd700);
        scene.superBar.setOrigin(0, 0.5);
        scene.superBar.setDepth(20);
        
        scene.add.text(200, 78, 'SUPER METER', { 
            fontFamily: 'JetBrains Mono', fontSize: '7px', color: '#ffd700', letterSpacing: '3px', fontWeight: 'bold'
        }).setOrigin(0, 0.5).setDepth(20);
        
        scene.superText = scene.add.text(200, 97, '0%', { 
            fontFamily: 'JetBrains Mono', fontSize: '7px', color: '#888888'
        }).setOrigin(0, 0.5).setDepth(20);
        
        // CPU SUPER METER - Right-aligned
        const cpuSuperBg = scene.add.rectangle(1280, 85, SUPER_BAR_MAX_WIDTH, 12, 0x1a1a1a);
        cpuSuperBg.setOrigin(1, 0.5);
        cpuSuperBg.setStrokeStyle(1, 0xffd700);
        cpuSuperBg.setDepth(19);
        
        scene.cpuSuperBar = scene.add.rectangle(1280, 85, 0, 8, 0xffd700);
        scene.cpuSuperBar.setOrigin(1, 0.5);
        scene.cpuSuperBar.setDepth(20);
        scene.cpuSuperBar.setAlpha(0.8);
        
        scene.add.text(1280, 78, 'CPU SUPER', { 
            fontFamily: 'JetBrains Mono', fontSize: '7px', color: '#ffd700', letterSpacing: '2px', fontWeight: 'bold'
        }).setOrigin(1, 0.5).setDepth(20);
        
        scene.cpuSuperText = scene.add.text(1280, 97, '0%', { 
            fontFamily: 'JetBrains Mono', fontSize: '7px', color: '#888888'
        }).setOrigin(1, 0.5).setDepth(20);
    }
    
    updateHealthBars() {
        const scene = this.scene;
        
        let playerWidth = HEALTH_BAR_MAX_WIDTH * (scene.playerHealth / 100);
        playerWidth = Math.min(Math.max(playerWidth, 0), HEALTH_BAR_MAX_WIDTH);
        scene.healthBarPlayer.width = playerWidth;
        
        let cpuWidth = HEALTH_BAR_MAX_WIDTH * (scene.cpuHealth / 100);
        cpuWidth = Math.min(Math.max(cpuWidth, 0), HEALTH_BAR_MAX_WIDTH);
        scene.healthBarCPU.width = cpuWidth;
        
        let superWidth = SUPER_BAR_MAX_WIDTH * (scene.superMeter / 100);
        superWidth = Math.min(Math.max(superWidth, 0), SUPER_BAR_MAX_WIDTH);
        scene.superBar.width = superWidth;
        
        let cpuSuperWidth = SUPER_BAR_MAX_WIDTH * (scene.cpuSuperMeter / 100);
        cpuSuperWidth = Math.min(Math.max(cpuSuperWidth, 0), SUPER_BAR_MAX_WIDTH);
        scene.cpuSuperBar.width = cpuSuperWidth;
        
        scene.playerHealthText.setText(`${Math.floor(scene.playerHealth)}%`);
        scene.cpuHealthText.setText(`${Math.floor(scene.cpuHealth)}%`);
        scene.superText.setText(`${Math.floor(scene.superMeter)}%`);
        scene.cpuSuperText.setText(`${Math.floor(scene.cpuSuperMeter)}%`);
        
        if (scene.playerHealth < 25) {
            scene.healthBarPlayer.setFillStyle(0xff003c);
            scene.playerHealthText.setColor('#ff003c');
        } else {
            scene.healthBarPlayer.setFillStyle(this.playerData.color);
            scene.playerHealthText.setColor('#aaaaaa');
        }
        
        if (scene.cpuHealth < 25) {
            scene.healthBarCPU.setFillStyle(0xff003c);
            scene.cpuHealthText.setColor('#ff003c');
        } else {
            scene.healthBarCPU.setFillStyle(this.cpuData.color);
            scene.cpuHealthText.setColor('#aaaaaa');
        }
    }
    
    showCombo() {
        const scene = this.scene;
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