/**
 * ANIMATIONS - Sprite Animation Handling
 */

// Helper function to resolve texture with facing-aware fallback
function resolveTextureKey(scene, sprite, baseKey, facing) {
    const facingKey = `${baseKey}-${facing}`;
    if (scene.textures.exists(facingKey)) {
        sprite.setFlipX(false); // real sprite handles facing, no flip needed
        return facingKey;
    }
    // Fallback: use base texture and flip it
    if (scene.textures.exists(baseKey)) {
        sprite.setFlipX(facing === 'left');
        return baseKey;
    }
    return null; // neither exists
}

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
        
        let textureKey = null;
        const facing = getFacingDirection(scene.player.x, scene.cpu.x, 'player');
        const baseFolder = this.playerData.folder;
        
        switch(animName) {
            case 'hurt':
                textureKey = resolveTextureKey(scene, scene.player, `${baseFolder}_hurt`, facing);
                break;
            case 'light':
                textureKey = resolveTextureKey(scene, scene.player, `${baseFolder}_punch`, facing);
                break;
            case 'medium':
                textureKey = resolveTextureKey(scene, scene.player, `${baseFolder}_punch`, facing);
                break;
            case 'heavy':
                textureKey = resolveTextureKey(scene, scene.player, `${baseFolder}_kick`, facing);
                break;
            case 'special':
                if (this.playerData.name === 'ALPINE') {
                    textureKey = resolveTextureKey(scene, scene.player, `${baseFolder}_special_drink`, facing);
                } else if (this.playerData.name === 'ADARSHA') {
                    textureKey = resolveTextureKey(scene, scene.player, `${baseFolder}_jumpstart`, facing);
                } else if (this.playerData.name === 'IRONMAN') {
                    textureKey = resolveTextureKey(scene, scene.player, `${baseFolder}_repulsor`, facing);
                } else {
                    textureKey = resolveTextureKey(scene, scene.player, `${baseFolder}_special`, facing);
                }
                break;
            case 'repulsor_charge':
                textureKey = resolveTextureKey(scene, scene.player, `${baseFolder}_repulsor`, facing);
                break;
            // ADARSHA SPECIAL ANIMATIONS
            case 'jumpstart':
                textureKey = resolveTextureKey(scene, scene.player, `${baseFolder}_jumpstart`, facing);
                break;
            case 'jump':
                textureKey = resolveTextureKey(scene, scene.player, `${baseFolder}_jump`, facing);
                break;
            case 'jumpkick':
                textureKey = resolveTextureKey(scene, scene.player, `${baseFolder}_jumpkick`, facing);
                break;
            case 'firestart':
                textureKey = resolveTextureKey(scene, scene.player, `${baseFolder}_firestart`, facing);
                break;
            case 'firing':
                textureKey = resolveTextureKey(scene, scene.player, `${baseFolder}_firing`, facing);
                break;
            // ALPINE SPECIAL ANIMATIONS
            case 'special_drink':
                textureKey = resolveTextureKey(scene, scene.player, `${baseFolder}_special_drink`, facing);
                break;
            case 'special_powerup':
                textureKey = resolveTextureKey(scene, scene.player, `${baseFolder}_special_powerup`, facing);
                break;
            case 'special_attack':
                textureKey = resolveTextureKey(scene, scene.player, `${baseFolder}_special_attack`, facing);
                break;
            case 'victory':
                textureKey = resolveTextureKey(scene, scene.player, `${baseFolder}_victory`, facing);
                break;
            case 'idle':
                textureKey = resolveTextureKey(scene, scene.player, `${baseFolder}_idle`, facing);
                break;
            case 'jump_regular':
                // Reuse the 'jump' texture for regular jumps
                textureKey = resolveTextureKey(scene, scene.player, `${baseFolder}_jump`, facing);
                break;
            default:
                textureKey = resolveTextureKey(scene, scene.player, `${baseFolder}_idle`, facing);
        }
        
        if (textureKey) {
            if (animName !== 'hurt' && animName !== 'idle' && !bypassAttackGuard) {
                scene.isAttacking = true;
            }
            scene.currentAnim = animName;
            scene.player.setTexture(textureKey);
            
            if (scene.animationTimer) scene.animationTimer.remove();
            
            scene.animationTimer = scene.time.delayedCall(duration, () => {
                if (scene.roundActive && scene.currentAnim !== 'victory') {
                    // Compute facing fresh at reset time in case the fighter crossed sides
                    const currentFacing = getFacingDirection(scene.player.x, scene.cpu.x, 'player');
                    const idleKey = resolveTextureKey(scene, scene.player, `${baseFolder}_idle`, currentFacing);
                    if (idleKey) {
                        scene.player.setTexture(idleKey);
                    }
                    scene.currentAnim = 'idle';
                }
                if (animName !== 'hurt' && animName !== 'idle' && !bypassAttackGuard) {
                    scene.isAttacking = false;
                }
                scene.animationTimer = null;
            });
        } else {
            console.warn(`No texture found for ${animName} (tried ${baseFolder}_${animName}-${facing} and ${baseFolder}_${animName})`);
        }
    }
    
    setCPUAnimation(animName, duration = 200, bypassFreeze = false) {
        const scene = this.scene;
        if (scene.cpuAttacking && animName !== 'hurt') return;
        if (!bypassFreeze && scene.isSuperFrozen) return;
        
        let textureKey = null;
        const facing = getFacingDirection(scene.player.x, scene.cpu.x, 'cpu');
        const baseFolder = this.cpuData.folder;
        
        switch(animName) {
            case 'hurt':
                textureKey = resolveTextureKey(scene, scene.cpu, `${baseFolder}_hurt`, facing);
                break;
            case 'light':
                textureKey = resolveTextureKey(scene, scene.cpu, `${baseFolder}_punch`, facing);
                break;
            case 'medium':
                textureKey = resolveTextureKey(scene, scene.cpu, `${baseFolder}_punch`, facing);
                break;
            case 'heavy':
                textureKey = resolveTextureKey(scene, scene.cpu, `${baseFolder}_kick`, facing);
                break;
            case 'special':
                if (this.cpuData.name === 'ALPINE') {
                    textureKey = resolveTextureKey(scene, scene.cpu, `${baseFolder}_special_drink`, facing);
                } else if (this.cpuData.name === 'IRONMAN') {
                    textureKey = resolveTextureKey(scene, scene.cpu, `${baseFolder}_repulsor`, facing);
                } else {
                    textureKey = resolveTextureKey(scene, scene.cpu, `${baseFolder}_special`, facing);
                }
                break;
            case 'victory':
                textureKey = resolveTextureKey(scene, scene.cpu, `${baseFolder}_victory`, facing);
                break;
            case 'idle':
                textureKey = resolveTextureKey(scene, scene.cpu, `${baseFolder}_idle`, facing);
                break;
            case 'jump_regular':
                textureKey = resolveTextureKey(scene, scene.cpu, `${baseFolder}_jump`, facing);
                break;
            default:
                textureKey = resolveTextureKey(scene, scene.cpu, `${baseFolder}_idle`, facing);
        }
        
        if (textureKey) {
            if (animName !== 'hurt' && animName !== 'idle') scene.cpuAttacking = true;
            scene.cpu.setTexture(textureKey);
            
            if (scene.cpuAnimationTimer) scene.cpuAnimationTimer.remove();
            
            scene.cpuAnimationTimer = scene.time.delayedCall(duration, () => {
                if (scene.roundActive) {
                    // Compute facing fresh at reset time in case the fighter crossed sides
                    const currentFacing = getFacingDirection(scene.player.x, scene.cpu.x, 'cpu');
                    const idleKey = resolveTextureKey(scene, scene.cpu, `${baseFolder}_idle`, currentFacing);
                    if (idleKey) {
                        scene.cpu.setTexture(idleKey);
                    }
                }
                if (animName !== 'hurt' && animName !== 'idle') scene.cpuAttacking = false;
                scene.cpuAnimationTimer = null;
            });
        } else {
            console.warn(`No CPU texture found for ${animName} (tried ${baseFolder}_${animName}-${facing} and ${baseFolder}_${animName})`);
        }
    }
}