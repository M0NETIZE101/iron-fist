/**
 * CONFIGURATION - Game Settings & Constants
 */

// Debug mode (set to false for production)
const DEBUG = false;

// Helper for conditional logging
function debugLog(...args) {
    if (DEBUG) console.log(...args);
}

// ========== RESPONSIVE POSITIONING ==========
// These are base values at 1280x720, will be scaled dynamically
const BASE_WIDTH = 1280;
const BASE_HEIGHT = 720;

// Helper function to get responsive position
function getResponsiveX(x, gameWidth = BASE_WIDTH) {
    return (x / BASE_WIDTH) * gameWidth;
}

function getResponsiveY(y, gameHeight = BASE_HEIGHT) {
    return (y / BASE_HEIGHT) * gameHeight;
}

// ========== UNIFIED CONSTANTS ==========
const HEALTH_BAR_MAX_WIDTH = 400;
const SUPER_BAR_MAX_WIDTH = 360;

// Jump physics
const JUMP_VELOCITY = -450;
const GRAVITY = 1200;
const GROUND_Y = 460;

// Movement bounds
const MIN_X = 200;
const MAX_X = 1080;

// Character sprite dimensions
const CHARACTER_WIDTH = 180;
const CHARACTER_HEIGHT = 270;
const AURA_WIDTH = 140;
const AURA_HEIGHT = 180;

// UI Positions (responsive)
const UI = {
    // Health Bars
    PLAYER_HEALTH_X: 200,
    PLAYER_HEALTH_Y: 40,
    PLAYER_HEALTH_BAR_WIDTH: 400,
    PLAYER_HEALTH_BAR_HEIGHT: 24,
    PLAYER_HEALTH_FILL_HEIGHT: 18,
    
    CPU_HEALTH_X: 1280,
    CPU_HEALTH_Y: 40,
    CPU_HEALTH_BAR_WIDTH: 400,
    CPU_HEALTH_BAR_HEIGHT: 24,
    CPU_HEALTH_FILL_HEIGHT: 18,
    
    // Name Plates
    PLAYER_NAME_X: 200,
    PLAYER_NAME_Y: 20,
    PLAYER_NAME_WIDTH: 140,
    PLAYER_NAME_HEIGHT: 20,
    
    CPU_NAME_X: 1280,
    CPU_NAME_Y: 20,
    CPU_NAME_WIDTH: 140,
    CPU_NAME_HEIGHT: 20,
    
    // Health Text
    PLAYER_HEALTH_TEXT_X: 200,
    PLAYER_HEALTH_TEXT_Y: 60,
    CPU_HEALTH_TEXT_X: 1280,
    CPU_HEALTH_TEXT_Y: 60,
    
    // Super Meters
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
    
    // Super Labels
    PLAYER_SUPER_LABEL_X: 200,
    PLAYER_SUPER_LABEL_Y: 78,
    CPU_SUPER_LABEL_X: 1280,
    CPU_SUPER_LABEL_Y: 78,
    
    // Super Text
    PLAYER_SUPER_TEXT_X: 200,
    PLAYER_SUPER_TEXT_Y: 97,
    CPU_SUPER_TEXT_X: 1280,
    CPU_SUPER_TEXT_Y: 97,
    
    // Timer
    TIMER_X: 640,
    TIMER_Y: 40,
    TIMER_WIDTH: 100,
    TIMER_HEIGHT: 36,
    
    // VS Text
    VS_X: 640,
    VS_Y: 320,
    
    // Combo Text
    COMBO_X: 640,
    COMBO_Y: 160,
    
    // Aura offsets
    AURA_Y_OFFSET: 10
};

// Attack frame data templates
const ATTACK_FRAMES = {
    LIGHT_STARTUP: 83,
    LIGHT_ACTIVE: 50,
    LIGHT_RECOVERY: 167,
    
    MEDIUM_STARTUP: 133,
    MEDIUM_ACTIVE: 67,
    MEDIUM_RECOVERY: 233,
    
    HEAVY_STARTUP: 200,
    HEAVY_ACTIVE: 83,
    HEAVY_RECOVERY: 333,
    
    SPECIAL_STARTUP: 250,
    SPECIAL_ACTIVE: 100,
    SPECIAL_RECOVERY: 417
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

// Difficulty settings
const difficultySettings = {
    easy: { 
        blockChance: 0.3, 
        damageMultiplier: 0.7, 
        attackDelay: 1000, 
        comboChance: 0.3, 
        superUsageChance: 0.3, 
        retreatThreshold: 0.25, 
        movementDelay: 0.6 
    },
    medium: { 
        blockChance: 0.5, 
        damageMultiplier: 1.0, 
        attackDelay: 800, 
        comboChance: 0.5, 
        superUsageChance: 0.5, 
        retreatThreshold: 0.3, 
        movementDelay: 0.8 
    },
    hard: { 
        blockChance: 0.7, 
        damageMultiplier: 1.3, 
        attackDelay: 600, 
        comboChance: 0.7, 
        superUsageChance: 0.8, 
        retreatThreshold: 0.35, 
        movementDelay: 1.0 
    }
};

// Arena backgrounds mapping
const arenaBackgrounds = {
    'NEO-TOKYO': 'assets/background/neo-tokyo.jpg',
    'CYBER-SHRINE': 'assets/background/cyber-shrine.jpg',
    'ORBITAL STATION': 'assets/background/orbital-station.jpg',
    'MAGMA CORE': 'assets/background/magma-core.jpg',
    'WASTELAND JUNKYARD': 'assets/background/junkyard.jpg',
    'VOID CHAMBER': 'assets/background/void-chamber.jpg'
};