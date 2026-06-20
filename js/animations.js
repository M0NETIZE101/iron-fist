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
            case 'hurt': textureKey = `${this.playerData.folder}_hurt-${facing}`; break;
            case 'light': textureKey = `${this.playerData.folder}_punch-${facing}`; break;
            case 'medium': textureKey = `${this.playerData.folder}_punch-${facing}`; break;
            case 'heavy': textureKey = `${this.playerData.folder}_kick-${facing}`; break;
            case 'special': 
                if (this.playerData.name === 'ALPINE') {
                    textureKey = `${this.playerData.folder}_special_drink`;
                } else if (this.playerData.name === 'ADARSHA') {
                    textureKey = `${this.playerData.folder}_jumpstart`;
                } else if (this.playerData.name === 'IRONMAN') {
                    textureKey = `${this.playerData.folder}_repulsor`;
                } else {
                    textureKey = `${this.playerData.folder}_special`;
                }
                break;
            case 'repulsor_charge': textureKey = `${this.playerData.folder}_repulsor`; break;
            // ADARSHA SPECIAL ANIMATIONS
            case 'jumpstart': textureKey = `${this.playerData.folder}_jumpstart`; break;
            case 'jump': textureKey = `${this.playerData.folder}_jump`; break;
            case 'jumpkick': textureKey = `${this.playerData.folder}_jumpkick`; break;
            case 'firestart': textureKey = `${this.playerData.folder}_firestart`; break;
            case 'firing': textureKey = `${this.playerData.folder}_firing`; break;
            // ALPINE SPECIAL ANIMATIONS
            case 'special_drink': textureKey = `${this.playerData.folder}_special_drink`; break;
            case 'special_powerup': textureKey = `${this.playerData.folder}_special_powerup`; break;
            case 'special_attack': textureKey = `${this.playerData.folder}_special_attack`; break;
            case 'victory': textureKey = `${this.playerData.folder}_victory`; break;
            case 'idle': textureKey = `${this.playerData.folder}_idle`; break;
            default: textureKey = `${this.playerData.folder}_idle`;
        }
        
        if (scene.textures.exists(textureKey)) {
            if (animName !== 'hurt' && animName !== 'idle' && !bypassAttackGuard) {
                scene.isAttacking = true;
            }
            scene.currentAnim = animName;
            scene.player.setTexture(textureKey);
            
            if (scene.animationTimer) scene.animationTimer.remove();
            
            scene.animationTimer = scene.time.delayedCall(duration, () => {
                if (scene.roundActive && scene.currentAnim !== 'victory') {
                    scene.player.setTexture(`${this.playerData.folder}_idle`);
                    scene.currentAnim = 'idle';
                }
                if (animName !== 'hurt' && animName !== 'idle' && !bypassAttackGuard) {
                    scene.isAttacking = false;
                }
                scene.animationTimer = null;
            });
        } else {
            console.warn(`Texture not found: ${textureKey}`);
        }
    }
    
    setCPUAnimation(animName, duration = 200, bypassFreeze = false) {
        const scene = this.scene;
        if (scene.cpuAttacking && animName !== 'hurt') return;
        if (!bypassFreeze && scene.isSuperFrozen) return;
        
        let textureKey;
        const facing = getFacingDirection(scene.player.x, scene.cpu.x, 'cpu');
        
        switch(animName) {
            case 'hurt': textureKey = `${this.cpuData.folder}_hurt-${facing}`; break;
            case 'light': textureKey = `${this.cpuData.folder}_punch-${facing}`; break;
            case 'medium': textureKey = `${this.cpuData.folder}_punch-${facing}`; break;
            case 'heavy': textureKey = `${this.cpuData.folder}_kick-${facing}`; break;
            case 'special':
                if (this.cpuData.name === 'ALPINE') {
                    textureKey = `${this.cpuData.folder}_special_drink`;
                } else if (this.cpuData.name === 'IRONMAN') {
                    textureKey = `${this.cpuData.folder}_repulsor`;
                } else {
                    textureKey = `${this.cpuData.folder}_special`;
                }
                break;
            case 'victory': textureKey = `${this.cpuData.folder}_victory`; break;
            case 'idle': textureKey = `${this.cpuData.folder}_idle`; break;
            default: textureKey = `${this.cpuData.folder}_idle`;
        }
        
        if (scene.textures.exists(textureKey)) {
            if (animName !== 'hurt' && animName !== 'idle') scene.cpuAttacking = true;
            scene.cpu.setTexture(textureKey);
            
            if (scene.cpuAnimationTimer) scene.cpuAnimationTimer.remove();
            
            scene.cpuAnimationTimer = scene.time.delayedCall(duration, () => {
                if (scene.roundActive) {
                    scene.cpu.setTexture(`${this.cpuData.folder}_idle`);
                }
                if (animName !== 'hurt' && animName !== 'idle') scene.cpuAttacking = false;
                scene.cpuAnimationTimer = null;
            });
        } else {
            console.warn(`CPU texture not found: ${textureKey}`);
        }
    }
}