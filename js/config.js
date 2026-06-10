/**
 * CONFIGURATION - Game Settings & Constants
 */

// UNIFIED CONSTANTS
const HEALTH_BAR_MAX_WIDTH = 400;
const SUPER_BAR_MAX_WIDTH = 360;

// Jump physics
const JUMP_VELOCITY = -450;
const GRAVITY = 1200;
const GROUND_Y = 460;

// Movement bounds
const MIN_X = 200;
const MAX_X = 1080;

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