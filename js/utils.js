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

// Get random CPU fighter (excluding player)
function getRandomCPU(playerFighter, allFightersList) {
    const availableCPUs = allFightersList.filter(f => f !== playerFighter);
    return availableCPUs[Math.floor(Math.random() * availableCPUs.length)];
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

// Get attack hitbox based on attack type and facing direction
function getAttackHitbox(attacker, attackType, facing, x, y) {
    const direction = facing === 'right' ? 1 : -1;
    // Attack origin: fist is roughly at edge of character sprite (CHARACTER_WIDTH/2 = 90px from center)
    const fistOffset = 70;
    const attackX = x + (direction * fistOffset);
    
    switch(attackType) {
        case 'light':
            return {
                x: attackX,
                y: y - 30,
                width: 60,
                height: 50,
                color: 0xffaa00,
                name: 'LIGHT ATTACK'
            };
        case 'medium':
            return {
                x: attackX,
                y: y - 40,
                width: 65,
                height: 55,
                color: 0xff6600,
                name: 'MEDIUM ATTACK'
            };
        case 'heavy':
            return {
                x: attackX,
                y: y - 50,
                width: 75,
                height: 65,
                color: 0xff3300,
                name: 'HEAVY ATTACK'
            };
        case 'special':
            return {
                x: attackX,
                y: y - 45,
                width: 80,
                height: 70,
                color: 0xffaa00,
                name: 'SPECIAL ATTACK'
            };
        default:
            return null;
    }
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