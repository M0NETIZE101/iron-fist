/**
 * ANIMATIONS - Sprite Animation Handling
 * Refactored: Single source of truth, no game logic mixing
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
        // Pre-build animation maps for faster lookup
        this.playerAnimMap = this.buildAnimMap(playerData);
        this.cpuAnimMap = this.buildAnimMap(cpuData);
    }

    /**
     * Build animation name mapping from fighter data
     * This replaces hardcoded switch statements
     */
    buildAnimMap(data) {
        // Default mapping: most characters use standard names
        const defaultMap = {
            'hurt': 'hurt',
            'light': 'punch',
            'medium': 'punch',
            'heavy': 'kick',
            'victory': 'victory',
            'idle': 'idle',
            'jump_regular': 'jump'
        };

        // Character-specific overrides - use the animMap from fighter data if available
        const charOverrides = data.animMap || {};

        // Merge default with character-specific overrides
        return { ...defaultMap, ...charOverrides };
    }

    /**
     * Generic animation setter - handles both player and CPU
     * This removes the 95% code duplication
     */
    setAnimation(target, data, animMap, animName, duration = 200, bypassFreeze = false, bypassAttackGuard = false) {
        const scene = this.scene;
        
        // Prevent animation if target doesn't exist
        if (!target) return;

        // Check if we should bypass freeze (for super moves, etc.)
        if (!bypassFreeze && scene.isSuperFrozen) return;

        // Clear any existing timer for this target
        this.clearTargetTimer(target);

        // Get the mapped animation name from the data
        const mappedAnim = animMap[animName] || animName;
        const baseFolder = data.folder;
        
        // Calculate facing direction
        const isPlayer = target === scene.player;
        const facing = isPlayer 
            ? getFacingDirection(scene.player.x, scene.cpu.x, 'player')
            : getFacingDirection(scene.player.x, scene.cpu.x, 'cpu');

        // Resolve the texture key with facing awareness
        const textureKey = resolveTextureKey(scene, target, `${baseFolder}_${mappedAnim}`, facing);

        if (textureKey) {
            // Apply the texture
            target.setTexture(textureKey);
            
            // Set a timer to return to idle (only for non-idle, non-victory animations)
            if (animName !== 'idle' && animName !== 'victory') {
                target._animTimer = scene.time.delayedCall(duration, () => {
                    if (scene.roundActive && target.active) {
                        // Refresh facing when resetting to idle
                        const currentFacing = isPlayer 
                            ? getFacingDirection(scene.player.x, scene.cpu.x, 'player')
                            : getFacingDirection(scene.player.x, scene.cpu.x, 'cpu');
                        const idleKey = resolveTextureKey(scene, target, `${baseFolder}_idle`, currentFacing);
                        if (idleKey) {
                            target.setTexture(idleKey);
                        }
                    }
                    target._animTimer = null;
                });
            }
        } else {
            // If no texture found, try to set idle as fallback
            const idleKey = resolveTextureKey(scene, target, `${baseFolder}_idle`, facing);
            if (idleKey) {
                target.setTexture(idleKey);
            }
            console.warn(`No texture found for ${animName} (mapped to ${mappedAnim}) for ${data.name}`);
        }
    }

    /**
     * Clear any pending animation timer for a target
     */
    clearTargetTimer(target) {
        if (target && target._animTimer) {
            target._animTimer.remove();
            target._animTimer = null;
        }
    }

    /**
     * Player animation wrapper
     */
    setPlayerAnimation(animName, duration = 200, bypassFreeze = false, bypassAttackGuard = false) {
        this.setAnimation(
            this.scene.player,
            this.playerData,
            this.playerAnimMap,
            animName,
            duration,
            bypassFreeze,
            bypassAttackGuard
        );
    }

    /**
     * CPU animation wrapper
     */
    setCPUAnimation(animName, duration = 200, bypassFreeze = false) {
        this.setAnimation(
            this.scene.cpu,
            this.cpuData,
            this.cpuAnimMap,
            animName,
            duration,
            bypassFreeze,
            false
        );
    }
}
