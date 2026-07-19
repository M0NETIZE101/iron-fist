/**
 * CONFIGURATION - Game Settings & Constants
 */

// Debug mode (press O in game to toggle) - GLOBAL
window.DEBUG_HITBOXES = false;

function toggleDebugMode() {
    window.DEBUG_HITBOXES = !window.DEBUG_HITBOXES;
    console.log('═══════════════════════════════════════');
    console.log(`🐞 DEBUG MODE: ${window.DEBUG_HITBOXES ? 'ON' : 'OFF'}`);
    if (window.DEBUG_HITBOXES) {
        console.log('   → Hitboxes are now VISIBLE');
        console.log('   → Damage numbers show body parts');
        console.log('   → Press O again to disable');
    }
    console.log('═══════════════════════════════════════');
}

// Helper for conditional logging
function debugLog(...args) {
    if (window.DEBUG_HITBOXES) console.log(...args);
}

// UNIFIED CONSTANTS
const HEALTH_BAR_MAX_WIDTH = 400;
const SUPER_BAR_MAX_WIDTH = 360;

// Jump physics
const JUMP_VELOCITY = -450;
const GRAVITY = 1200;
const GROUND_Y = 460;

// DOUBLE JUMP CONSTANTS
const DOUBLE_JUMP_VELOCITY = -420;
const DOUBLE_JUMP_HORIZONTAL_BOOST = 14;
const DOUBLE_JUMP_COOLDOWN_MS = 2000;

// Movement bounds
const MIN_X = 200;
const MAX_X = 1080;

// Character sprite dimensions
const CHARACTER_WIDTH = 180;
const CHARACTER_HEIGHT = 270;
const AURA_WIDTH = 140;
const AURA_HEIGHT = 180;

// Base screen dimensions for responsive positioning
const BASE_WIDTH = 1280;
const BASE_HEIGHT = 720;

// UI Positions
const UI = {
    PLAYER_HEALTH_X: 200,
    PLAYER_HEALTH_Y: 45,
    PLAYER_HEALTH_BAR_WIDTH: 400,
    PLAYER_HEALTH_BAR_HEIGHT: 24,
    PLAYER_HEALTH_FILL_HEIGHT: 18,
    
    CPU_HEALTH_X: 1280,
    CPU_HEALTH_Y: 45,
    CPU_HEALTH_BAR_WIDTH: 400,
    CPU_HEALTH_BAR_HEIGHT: 24,
    CPU_HEALTH_FILL_HEIGHT: 18,
    
    PLAYER_NAME_X: 200,
    PLAYER_NAME_Y: 25,
    PLAYER_NAME_WIDTH: 140,
    PLAYER_NAME_HEIGHT: 20,
    
    CPU_NAME_X: 1280,
    CPU_NAME_Y: 25,
    CPU_NAME_WIDTH: 140,
    CPU_NAME_HEIGHT: 20,
    
    PLAYER_HEALTH_TEXT_X: 200,
    PLAYER_HEALTH_TEXT_Y: 65,
    CPU_HEALTH_TEXT_X: 1280,
    CPU_HEALTH_TEXT_Y: 65,
    
    PLAYER_SUPER_X: 200,
    PLAYER_SUPER_Y: 85,
    PLAYER_SUPER_WIDTH: 360,
    PLAYER_SUPER_HEIGHT: 12,
    PLAYER_SUPER_FILL_HEIGHT: 8,
    
    CPU_SUPER_X: 1280,
    CPU_SUPER_Y: 85,
    CPU_SUPER_WIDTH: 360,
    CPU_SUPER_HEIGHT: 12,
    CPU_SUPER_FILL_HEIGHT: 8,
    
    PLAYER_SUPER_LABEL_X: 200,
    PLAYER_SUPER_LABEL_Y: 78,
    CPU_SUPER_LABEL_X: 1280,
    CPU_SUPER_LABEL_Y: 78,
    
    PLAYER_SUPER_TEXT_X: 200,
    PLAYER_SUPER_TEXT_Y: 97,
    CPU_SUPER_TEXT_X: 1280,
    CPU_SUPER_TEXT_Y: 97,
    
    TIMER_X: 680,
    TIMER_Y: 35,
    TIMER_WIDTH: 90,
    TIMER_HEIGHT: 36,
    
    VS_X: 640,
    VS_Y: 320,
    
    COMBO_X: 640,
    COMBO_Y: 160,
    
    AURA_Y_OFFSET: 10
};

// Character starting positions
const START_POSITIONS = {
    PLAYER_X: 400,
    PLAYER_Y: 460,
    CPU_X: 900,
    CPU_Y: 460
};

// Frame timing helper
const FRAME_TIME_MS = 16.666;
const frameToMs = (frames) => frames * FRAME_TIME_MS;

// Difficulty settings with reaction times
const difficultySettings = {
    easy: { 
        blockChance: 0.3, 
        damageMultiplier: 0.7, 
        attackDelay: 1000, 
        comboChance: 0.3, 
        superUsageChance: 0.3, 
        retreatThreshold: 0.25, 
        movementDelay: 0.6,
        reactionTime: 200, // 200ms reaction time
        name: 'easy' 
    },
    medium: { 
        blockChance: 0.5, 
        damageMultiplier: 1.0, 
        attackDelay: 800, 
        comboChance: 0.5, 
        superUsageChance: 0.5, 
        retreatThreshold: 0.3, 
        movementDelay: 0.8,
        reactionTime: 120, // 120ms reaction time
        name: 'medium' 
    },
    hard: { 
        blockChance: 0.7, 
        damageMultiplier: 1.3, 
        attackDelay: 600, 
        comboChance: 0.7, 
        superUsageChance: 0.8, 
        retreatThreshold: 0.35, 
        movementDelay: 1.0,
        reactionTime: 50, // 50ms reaction time (very fast)
        name: 'hard' 
    }
};

// Arena backgrounds mapping
const arenaBackgrounds = {
    'NEO-TOKYO': 'assets/background/neo-tokyo.jpg',
    'CYBER-SHRINE': 'assets/background/cyber-shrine.jpg',
    'ORBITAL STATION': 'assets/background/orbital-station.jpg',
    'MAGMA CORE': 'assets/background/magma-core.jpg',
    'WASTELAND JUNKYARD': 'assets/background/junkyard.jpg',
    'VOID CHAMBER': 'assets/background/void-chamber.jpg',
    'X-MANSION': 'assets/background/x-mansion.jpg',
    'JJK_HIGHSCHOOL': 'assets/background/jjk_highschool.jpg',
    'AVENGERS_TOWER': 'assets/background/avengers_tower.jpg',
    'HIDDEN_LEAF_VILLAGE': 'assets/background/hidden_leaf_village.jpg',
    'VALLEY_OF_DEATH': 'assets/background/valley_of_death.jpg',
    'WALL_MARIA': 'assets/background/wall_maria.jpg'
};
