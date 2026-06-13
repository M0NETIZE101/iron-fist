/**
 * UI - Health Bars, Super Meters, Combo Display
 * ULTRA-SAFE VERSION with element existence checks
 */

class FightingUI {
    constructor(scene, playerData, cpuData) {
        this.scene = scene;
        this.playerData = playerData;
        this.cpuData = cpuData;
        this.ready = false;
    }
    
    createHealthBars() {
        const scene = this.scene;
        if (!scene) return;
        
        // Player health bar background
        const playerBarBg = scene.add.rectangle(
            UI.PLAYER_HEALTH_X, UI.PLAYER_HEALTH_Y, 
            HEALTH_BAR_MAX_WIDTH, UI.PLAYER_HEALTH_BAR_HEIGHT, 0x1a1a1a
        );
        if (playerBarBg) {
            playerBarBg.setStrokeStyle(2, this.playerData.accent);
            playerBarBg.setOrigin(0, 0.5);
            playerBarBg.setDepth(20);
        }
        
        // Player health bar fill
        scene.healthBarPlayer = scene.add.rectangle(
            UI.PLAYER_HEALTH_X, UI.PLAYER_HEALTH_Y, 
            HEALTH_BAR_MAX_WIDTH, UI.PLAYER_HEALTH_FILL_HEIGHT, this.playerData.color
        );
        if (scene.healthBarPlayer) {
            scene.healthBarPlayer.setOrigin(0, 0.5);
            scene.healthBarPlayer.setDepth(21);
        }
        
        // Player name background
        const playerNameBg = scene.add.rectangle(
            UI.PLAYER_NAME_X, UI.PLAYER_NAME_Y, 
            UI.PLAYER_NAME_WIDTH, UI.PLAYER_NAME_HEIGHT, 0x000000
        );
        if (playerNameBg) {
            playerNameBg.setOrigin(0, 0.5);
            playerNameBg.setStrokeStyle(1, this.playerData.accent);
            playerNameBg.setDepth(20);
        }
        
        // Player name text
        scene.playerNameText = scene.add.text(
            UI.PLAYER_NAME_X, UI.PLAYER_NAME_Y, this.playerData.name, { 
                fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#ffb3b2', 
                letterSpacing: '2px', fontWeight: 'bold'
            }
        );
        if (scene.playerNameText) scene.playerNameText.setOrigin(0, 0.5).setDepth(21);
        
        // Player health percent text
        scene.playerHealthText = scene.add.text(
            UI.PLAYER_HEALTH_TEXT_X, UI.PLAYER_HEALTH_TEXT_Y, '100%', { 
                fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#aaaaaa', fontWeight: 'bold'
            }
        );
        if (scene.playerHealthText) scene.playerHealthText.setOrigin(0, 0.5).setDepth(21);
        
        // CPU health bar background (right-aligned)
        const cpuBarBg = scene.add.rectangle(
            UI.CPU_HEALTH_X, UI.CPU_HEALTH_Y, 
            HEALTH_BAR_MAX_WIDTH, UI.CPU_HEALTH_BAR_HEIGHT, 0x1a1a1a
        );
        if (cpuBarBg) {
            cpuBarBg.setStrokeStyle(2, this.cpuData.accent);
            cpuBarBg.setOrigin(1, 0.5);
            cpuBarBg.setDepth(20);
        }
        
        // CPU health bar fill
        scene.healthBarCPU = scene.add.rectangle(
            UI.CPU_HEALTH_X, UI.CPU_HEALTH_Y, 
            HEALTH_BAR_MAX_WIDTH, UI.CPU_HEALTH_FILL_HEIGHT, this.cpuData.color
        );
        if (scene.healthBarCPU) {
            scene.healthBarCPU.setOrigin(1, 0.5);
            scene.healthBarCPU.setDepth(21);
        }
        
        // CPU name background
        const cpuNameBg = scene.add.rectangle(
            UI.CPU_NAME_X, UI.CPU_NAME_Y, 
            UI.CPU_NAME_WIDTH, UI.CPU_NAME_HEIGHT, 0x000000
        );
        if (cpuNameBg) {
            cpuNameBg.setOrigin(1, 0.5);
            cpuNameBg.setStrokeStyle(1, this.cpuData.accent);
            cpuNameBg.setDepth(20);
        }
        
        // CPU name text
        scene.cpuNameText = scene.add.text(
            UI.CPU_NAME_X, UI.CPU_NAME_Y, this.cpuData.name, { 
                fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#00dbe9', 
                letterSpacing: '2px', fontWeight: 'bold'
            }
        );
        if (scene.cpuNameText) scene.cpuNameText.setOrigin(1, 0.5).setDepth(21);
        
        // CPU health percent text
        scene.cpuHealthText = scene.add.text(
            UI.CPU_HEALTH_TEXT_X, UI.CPU_HEALTH_TEXT_Y, '100%', { 
                fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#aaaaaa', fontWeight: 'bold'
            }
        );
        if (scene.cpuHealthText) scene.cpuHealthText.setOrigin(1, 0.5).setDepth(21);
    }
    
   createSuperMeters() {
    const scene = this.scene;
    if (!scene) return;
    
    // Player super bar (left-aligned) - same as before
    const playerSuperBg = scene.add.rectangle(
        UI.PLAYER_SUPER_X, UI.PLAYER_SUPER_Y, 
        SUPER_BAR_MAX_WIDTH, UI.PLAYER_SUPER_HEIGHT, 0x1a1a1a
    );
    if (playerSuperBg) {
        playerSuperBg.setOrigin(0, 0.5);
        playerSuperBg.setStrokeStyle(1, 0xffd700);
        playerSuperBg.setDepth(19);
    }
    
    scene.superBar = scene.add.rectangle(
        UI.PLAYER_SUPER_X, UI.PLAYER_SUPER_Y, 
        0, UI.PLAYER_SUPER_FILL_HEIGHT, 0xffd700
    );
    if (scene.superBar) {
        scene.superBar.setOrigin(0, 0.5);
        scene.superBar.setDepth(20);
    }
    
    // ... labels for player (unchanged) ...
    
    // ========== CPU SUPER METER - FIXED OVERFLOW ==========
    // Background: right-aligned, width = SUPER_BAR_MAX_WIDTH
    const cpuSuperBg = scene.add.rectangle(
        UI.CPU_SUPER_X, UI.CPU_SUPER_Y, 
        SUPER_BAR_MAX_WIDTH, UI.CPU_SUPER_HEIGHT, 0x1a1a1a
    );
    if (cpuSuperBg) {
        cpuSuperBg.setOrigin(1, 0.5);   // right-aligned
        cpuSuperBg.setStrokeStyle(1, 0xffd700);
        cpuSuperBg.setDepth(19);
    }
    
    // Fill bar: also right-aligned, starts at full width, shrinks as meter increases
    // But we want it to fill from left to right? No, CPU bar should fill from left to right as meter increases.
    // For right-aligned container, if origin is 1, width should increase to the left.
    // However, the common approach: set origin to 0 and position at the container's left edge.
    // Let's simplify: position the fill bar at the same left edge as the background's left edge.
    const bgLeft = UI.CPU_SUPER_X - SUPER_BAR_MAX_WIDTH;
    scene.cpuSuperBar = scene.add.rectangle(
        bgLeft, UI.CPU_SUPER_Y, 
        0, UI.CPU_SUPER_FILL_HEIGHT, 0xffd700
    );
    if (scene.cpuSuperBar) {
        scene.cpuSuperBar.setOrigin(0, 0.5);  // left-aligned, grows right
        scene.cpuSuperBar.setDepth(20);
        scene.cpuSuperBar.setAlpha(0.8);
    }
    
    // Labels for CPU (right-aligned text)
    scene.cpuSuperLabel = scene.add.text(
        UI.CPU_SUPER_LABEL_X, UI.CPU_SUPER_LABEL_Y, 'CPU SUPER', { 
            fontFamily: 'JetBrains Mono', fontSize: '7px', color: '#ffd700', 
            letterSpacing: '2px', fontWeight: 'bold'
        }
    );
    if (scene.cpuSuperLabel) scene.cpuSuperLabel.setOrigin(1, 0.5).setDepth(20);
    
    scene.cpuSuperText = scene.add.text(
        UI.CPU_SUPER_TEXT_X, UI.CPU_SUPER_TEXT_Y, '0%', { 
            fontFamily: 'JetBrains Mono', fontSize: '7px', color: '#888888'
        }
    );
    if (scene.cpuSuperText) scene.cpuSuperText.setOrigin(1, 0.5).setDepth(20);
    
    this.ready = true;
}
    
    updateHealthBars() {
        // Do nothing if UI not yet created
        if (!this.ready) return;
        
        const scene = this.scene;
        if (!scene) return;
        
        // Update player health bar
        if (scene.healthBarPlayer) {
            let w = HEALTH_BAR_MAX_WIDTH * (scene.playerHealth / 100);
            w = Math.min(Math.max(w, 0), HEALTH_BAR_MAX_WIDTH);
            scene.healthBarPlayer.width = w;
        }
        
        // Update CPU health bar
        if (scene.healthBarCPU) {
            let w = HEALTH_BAR_MAX_WIDTH * (scene.cpuHealth / 100);
            w = Math.min(Math.max(w, 0), HEALTH_BAR_MAX_WIDTH);
            scene.healthBarCPU.width = w;
        }
        
        // Update player super bar
        if (scene.superBar) {
            let w = SUPER_BAR_MAX_WIDTH * (scene.superMeter / 100);
            w = Math.min(Math.max(w, 0), SUPER_BAR_MAX_WIDTH);
            scene.superBar.width = w;
        }
        
        // Update CPU super bar
        if (scene.cpuSuperBar) {
            let w = SUPER_BAR_MAX_WIDTH * (scene.cpuSuperMeter / 100);
            w = Math.min(Math.max(w, 0), SUPER_BAR_MAX_WIDTH);
            scene.cpuSuperBar.width = w;
        }
        
        // Update text values
        if (scene.playerHealthText) scene.playerHealthText.setText(`${Math.floor(scene.playerHealth)}%`);
        if (scene.cpuHealthText) scene.cpuHealthText.setText(`${Math.floor(scene.cpuHealth)}%`);
        if (scene.superText) scene.superText.setText(`${Math.floor(scene.superMeter)}%`);
        if (scene.cpuSuperText) scene.cpuSuperText.setText(`${Math.floor(scene.cpuSuperMeter)}%`);
        
        // Low‑health colors
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
        if (!scene || !scene.comboText) return;
        
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