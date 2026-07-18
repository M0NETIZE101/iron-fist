/**
 * UTILITIES - Helper Functions & Hitbox System
 */

// Get facing direction based on positions
function getFacingDirection(playerX, cpuX, character) {
    if (character === 'player') {
        return playerX < cpuX ? 'right' : 'left';
    } else {
        return cpuX < playerX ? 'right' : 'left';
    }
}

// Show floating text on screen
function showFloatingText(scene, x, y, text, color, duration = 500) {
    const floatingText = scene.add.text(x, y, text, {
        fontFamily: 'Anybody',
        fontSize: '28px',
        color: color,
        fontStyle: 'bold italic',
        stroke: '#000000',
        strokeThickness: 3
    }).setOrigin(0.5);
    scene.tweens.add({ targets: floatingText, y: y - 50, alpha: 0, duration: duration, onComplete: () => floatingText.destroy() });
}

// ========== HITBOX SYSTEM ==========

// Get character hurtboxes (head, body, legs)
function getHurtboxes(character, x, y, difficulty = 'medium') {
    // Base widths - matching sprite size (CHARACTER_WIDTH = 180)
    const headWidth = 70;
    const headHeight = 45;
    const bodyWidth = 90;
    const bodyHeight = 65;
    const legsWidth = 80;
    const legsHeight = 55;
    
    // CPU gets slightly larger hurtboxes on higher difficulties (easier to hit)
    let scale = 1.0;
    if (character === 'cpu') {
        if (difficulty === 'hard') scale = 1.1;
        else if (difficulty === 'easy') scale = 0.9;
    }
    
    const finalHeadWidth = headWidth * scale;
    const finalBodyWidth = bodyWidth * scale;
    const finalLegsWidth = legsWidth * scale;
    
    return {
        head: { 
            x: x - finalHeadWidth / 2, 
            y: y - 85, 
            width: finalHeadWidth, 
            height: headHeight, 
            multiplier: 1.2, 
            color: 0xff0000, 
            name: 'HEAD' 
        },
        body: { 
            x: x - finalBodyWidth / 2, 
            y: y - 40, 
            width: finalBodyWidth, 
            height: bodyHeight, 
            multiplier: 1.0, 
            color: 0x00ff00, 
            name: 'BODY' 
        },
        legs: { 
            x: x - finalLegsWidth / 2, 
            y: y + 25, 
            width: finalLegsWidth, 
            height: legsHeight, 
            multiplier: 0.8, 
            color: 0x0000ff, 
            name: 'LEGS' 
        }
    };
}

// Get attack hitbox based on attack type, facing direction, and attack height
function getAttackHitbox(attacker, attackType, facing, x, y, attackHeight = 'mid') {
    const direction = facing === 'right' ? 1 : -1;
    const fistOffset = 70;
    const attackX = x + (direction * fistOffset);
    
    // Base dimensions based on attack type
    let width = 60, height = 50;
    if (attackType === 'medium') { width = 65; height = 55; }
    if (attackType === 'heavy') { width = 75; height = 65; }
    if (attackType === 'special') { width = 80; height = 70; }

    // ===== FIX: Adjust Y position based on attack height =====
    let hitY = y - 10; // Default 'mid' (centered on body)
    
    if (attackHeight === 'low') {
        hitY = y + 30; // Drop hitbox down to the legs
        height = 40;   // Make it flatter, like a sweep
    } else if (attackHeight === 'overhead' || attackHeight === 'high') {
        hitY = y - 60; // Raise hitbox up to the head
    }

    return {
        x: attackX,
        y: hitY - (height / 2), // Center the hitbox vertically on the new Y
        width: width,
        height: height,
        color: 0xffaa00,
        name: `${attackType.toUpperCase()} ATTACK`
    };
}

// Rectangle collision detection
function checkRectCollision(rect1, rect2) {
    if (!rect1 || !rect2) return false;
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Get collision result with body part
function getCollisionResult(attackHitbox, hurtboxes) {
    if (!attackHitbox) return { hit: false };
    
    for (const [part, hurtbox] of Object.entries(hurtboxes)) {
        if (checkRectCollision(attackHitbox, hurtbox)) {
            return {
                hit: true,
                bodyPart: part,
                multiplier: hurtbox.multiplier,
                partName: hurtbox.name || part.toUpperCase()
            };
        }
    }
    return { hit: false };
}

// Draw hitbox for debug mode
function drawHitbox(graphics, hitbox, color, isActive = true) {
    if (!hitbox) return;
    graphics.lineStyle(2, color, isActive ? 0.9 : 0.4);
    graphics.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
    graphics.fillStyle(color, isActive ? 0.25 : 0.1);
    graphics.fillRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
}
