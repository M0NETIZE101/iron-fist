/**
 * ANIMATIONS - Sprite Animation Handling
 */

class Animations {
    constructor(scene, playerData, cpuData) {
        this.scene = scene;
        this.playerData = playerData;
        this.cpuData = cpuData;
    }
    
    setPlayerAnimation(animName, duration = 200, bypassFreeze = false, bypassAttackGuard = false) {
        const scene = this.scene;
        if (scene.isAttacking && !bypassAttackGuard && animName !== 'hurt') return;
        if (!bypassFreeze && scene.isSuperFrozen) return;
        
        let textureKey;
        const facing = getFacingDirection(scene.player.x, scene.cpu.x, 'player');
        
        switch(animName) {
            case 'hurt': textureKey = `${this.playerData.folder}_hurt`; break;
            case 'light': textureKey = `${this.playerData.folder}_punch-${facing}`; break;
            case 'medium': textureKey = `${this.playerData.folder}_punch-${facing}`; break;
            case 'heavy': 
                if (this.playerData.name === 'ALPINE') {
                    textureKey = `${this.playerData.folder}_kick-${facing}`;
                } else {
                    textureKey = `${this.playerData.folder}_kick`;
                }
                break;
            case 'special': 
                if (this.playerData.name === 'ALPINE') {
                    textureKey = `${this.playerData.folder}_special_drink`;
                } else {
                    textureKey = `${this.playerData.folder}_special`;
                }
                break;
            case 'special_drink': textureKey = `${this.playerData.folder}_special_drink`; break;
            case 'special_powerup': textureKey = `${this.playerData.folder}_special_powerup`; break;
            case 'special_attack': textureKey = `${this.playerData.folder}_special_attack`; break;
            case 'victory': textureKey = `${this.playerData.folder}_victory`; break;
            case 'jump': textureKey = `${this.playerData.folder}_idle`; break;
            default: textureKey = `${this.playerData.folder}_idle`;
        }
        
        if (scene.textures.exists(textureKey)) {
            if (animName !== 'hurt' && !bypassAttackGuard) scene.isAttacking = true;
            scene.currentAnim = animName;
            scene.player.setTexture(textureKey);
            
            if (scene.animationTimer) scene.animationTimer.remove();
            
            scene.animationTimer = scene.time.delayedCall(duration, () => {
                if (scene.roundActive && scene.currentAnim !== 'victory') {
                    scene.player.setTexture(`${this.playerData.folder}_idle`);
                    scene.currentAnim = 'idle';
                }
                if (animName !== 'hurt' && !bypassAttackGuard) scene.isAttacking = false;
                scene.animationTimer = null;
            });
        }
    }
    
    setCPUAnimation(animName, duration = 200, bypassFreeze = false) {
        const scene = this.scene;
        if (scene.cpuAttacking && animName !== 'hurt') return;
        if (!bypassFreeze && scene.isSuperFrozen) return;
        
        let textureKey;
        const facing = getFacingDirection(scene.player.x, scene.cpu.x, 'cpu');
        
        switch(animName) {
            case 'hurt': textureKey = `${this.cpuData.folder}_hurt`; break;
            case 'light': textureKey = `${this.cpuData.folder}_punch-${facing}`; break;
            case 'medium': textureKey = `${this.cpuData.folder}_punch-${facing}`; break;
            case 'heavy':
                if (this.cpuData.name === 'ALPINE') {
                    textureKey = `${this.cpuData.folder}_kick-${facing}`;
                } else {
                    textureKey = `${this.cpuData.folder}_kick`;
                }
                break;
            case 'special':
                if (this.cpuData.name === 'ALPINE') {
                    textureKey = `${this.cpuData.folder}_special_drink`;
                } else {
                    textureKey = `${this.cpuData.folder}_special`;
                }
                break;
            case 'victory': textureKey = `${this.cpuData.folder}_victory`; break;
            default: textureKey = `${this.cpuData.folder}_idle`;
        }
        
        if (scene.textures.exists(textureKey)) {
            if (animName !== 'hurt') scene.cpuAttacking = true;
            scene.cpu.setTexture(textureKey);
            
            if (scene.cpuAnimationTimer) scene.cpuAnimationTimer.remove();
            
            scene.cpuAnimationTimer = scene.time.delayedCall(duration, () => {
                if (scene.roundActive) {
                    scene.cpu.setTexture(`${this.cpuData.folder}_idle`);
                }
                if (animName !== 'hurt') scene.cpuAttacking = false;
                scene.cpuAnimationTimer = null;
            });
        }
    }
}