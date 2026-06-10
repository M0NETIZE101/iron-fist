/**
 * UTILITIES - Helper Functions
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