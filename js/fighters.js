/**
 * CHIYA GANG WARRIORS - Fighter Database
 * Single source of truth for all character data
 * Used by both characterselect.html and game.html
 */

const FIGHTERS = {
    'ADARSHA': { 
        name: 'ADARSHA', 
        title: 'CYBERNETIC MONK',
        archetype: 'RUSH-DOWN',
        rank: 'ELITE RANK',
        power: 88, 
        speed: 94, 
        defense: 78,
        range: 42,
        color: 0xff5252, 
        accent: 0xffb3b2, 
        folder: 'adarsha',
        specialName: 'CHIYA RUSH', 
        specialDamage: 18,
        // AI Personality
        personality: {
            type: 'RUSH-DOWN',
            playStyle: 'AGGRESSIVE',
            optimalRange: 80,
            preferredAttacks: ['light', 'medium', 'heavy'],
            specialUsage: 'OFFENSIVE',
            movementStyle: 'FORWARD',
            defenseStyle: 'AGGRESSIVE_BLOCK',
            comboPreference: 'LIGHT_START'
        },
        // Attack frame data (in milliseconds at 60fps)
        attacks: {
            light: { startup: 83, active: 50, recovery: 167, damage: 6, range: 70, height: 'mid', pushback: 20 },
            medium: { startup: 133, active: 67, recovery: 233, damage: 10, range: 75, height: 'mid', pushback: 28 },
            heavy: { startup: 200, active: 83, recovery: 333, damage: 15, range: 80, height: 'overhead', pushback: 35 },
            special: { startup: 250, active: 100, recovery: 417, damage: 18, range: 90, height: 'mid', pushback: 40 }
        },
        // Display assets
        portrait: 'assets/characters/adarsha/portrait.png',
        thumb: 'assets/characters/adarsha/portrait.png'
    },
    
    'ASHMIN': { 
        name: 'ASHMIN', 
        title: 'PROTOCOL-X',
        archetype: 'ZONER',
        rank: 'LEGEND',
        power: 90, 
        speed: 91, 
        defense: 75,
        range: 78,
        color: 0x00dbe9, 
        accent: 0x7df4ff, 
        folder: 'ashmin',
        specialName: 'PROTOCOL BLAST', 
        specialDamage: 15,
        // AI Personality
        personality: {
            type: 'ZONER',
            playStyle: 'DEFENSIVE',
            optimalRange: 150,
            preferredAttacks: ['special', 'medium', 'light'],
            specialUsage: 'DEFENSIVE',
            movementStyle: 'KITE',
            defenseStyle: 'PASSIVE_BLOCK',
            comboPreference: 'SPECIAL_START'
        },
        // Attack frame data
        attacks: {
            light: { startup: 67, active: 50, recovery: 150, damage: 5, range: 65, height: 'low', pushback: 18 },
            medium: { startup: 117, active: 67, recovery: 200, damage: 9, range: 70, height: 'mid', pushback: 25 },
            heavy: { startup: 167, active: 83, recovery: 300, damage: 13, range: 75, height: 'mid', pushback: 32 },
            special: { startup: 333, active: 133, recovery: 500, damage: 15, range: 250, height: 'projectile', pushback: 25 }
        },
        // Display assets
        portrait: 'assets/characters/ashmin/portrait.jpg',
        thumb: 'assets/characters/ashmin/portrait.jpg'
    },
    
    'ALPINE': { 
        name: 'ALPINE', 
        title: 'THE ALPINE CLIMBER',
        archetype: 'BALANCED',
        rank: 'MOUNTAIN MASTER',
        power: 85, 
        speed: 82, 
        defense: 88,
        range: 88,
        color: 0x4a90e2, 
        accent: 0x7cb8f0, 
        folder: 'alpine',
        specialName: 'ENERGY FIST', 
        specialDamage: 26,
        // AI Personality
        personality: {
            type: 'BALANCED',
            playStyle: 'COUNTER',
            optimalRange: 100,
            preferredAttacks: ['medium', 'heavy', 'special'],
            specialUsage: 'REACTIVE',
            movementStyle: 'ADAPTIVE',
            defenseStyle: 'COUNTER_BLOCK',
            comboPreference: 'MEDIUM_START'
        },
        // Attack frame data
        attacks: {
            light: { startup: 100, active: 50, recovery: 183, damage: 7, range: 75, height: 'mid', pushback: 22 },
            medium: { startup: 150, active: 67, recovery: 250, damage: 11, range: 80, height: 'overhead', pushback: 30 },
            heavy: { startup: 233, active: 100, recovery: 367, damage: 16, range: 85, height: 'low', pushback: 38 },
            special: { startup: 300, active: 117, recovery: 467, damage: 26, range: 140, height: 'mid', pushback: 50 }
        },
        // Display assets
        portrait: 'assets/characters/alpine/portrait.png',
        thumb: 'assets/characters/alpine/portrait.png'
    },

    'PRESIDENT': { 
        name: 'PRESIDENT', 
        title: 'THE COMMANDER-IN-CHIEF',
        archetype: 'POWER',
        rank: 'PRESIDENTIAL RANK',
        power: 95, 
        speed: 70, 
        defense: 85,
        range: 65,
        color: 0x1a5276,
        accent: 0x85c1e9,
        folder: 'president',
        specialName: 'EXECUTIVE ORDER', 
        specialDamage: 22,
        // AI Personality
        personality: {
            type: 'POWER',
            playStyle: 'BULLDOZER',
            optimalRange: 70,
            preferredAttacks: ['heavy', 'special', 'medium'],
            specialUsage: 'OFFENSIVE',
            movementStyle: 'FORWARD',
            defenseStyle: 'COUNTER_BLOCK',
            comboPreference: 'HEAVY_START'
        },
        // Attack frame data
        attacks: {
            light: { startup: 100, active: 50, recovery: 167, damage: 8, range: 70, height: 'mid', pushback: 25 },
            medium: { startup: 133, active: 67, recovery: 200, damage: 12, range: 75, height: 'mid', pushback: 32 },
            heavy: { startup: 183, active: 83, recovery: 250, damage: 18, range: 80, height: 'overhead', pushback: 40 },
            special: { startup: 200, active: 100, recovery: 300, damage: 22, range: 85, height: 'mid', pushback: 50 }
        },
        // Display assets
        portrait: 'assets/characters/president/portrait.png',
        thumb: 'assets/characters/president/portrait.png'
    },

    'IRONMAN': { 
        name: 'IRONMAN', 
        title: 'THE INVINCIBLE IRON MAN',
        archetype: 'TECH',
        rank: 'AVENGER RANK',
        power: 92, 
        speed: 85, 
        defense: 90,
        range: 75,
        color: 0xc71f1f,
        accent: 0xffd700,
        folder: 'ironman',
        specialName: 'REPULSOR BLAST', 
        specialDamage: 24,
        // AI Personality
        personality: {
            type: 'TECH',
            playStyle: 'BALANCED',
            optimalRange: 90,
            preferredAttacks: ['medium', 'heavy', 'special'],
            specialUsage: 'OFFENSIVE',
            movementStyle: 'FORWARD',
            defenseStyle: 'TECH_BLOCK',
            comboPreference: 'MEDIUM_START'
        },
        // Attack frame data
        attacks: {
            light: { startup: 90, active: 50, recovery: 160, damage: 7, range: 72, height: 'mid', pushback: 22 },
            medium: { startup: 130, active: 60, recovery: 210, damage: 11, range: 78, height: 'mid', pushback: 30 },
            heavy: { startup: 190, active: 80, recovery: 310, damage: 17, range: 85, height: 'overhead', pushback: 38 },
            special: { startup: 280, active: 100, recovery: 400, damage: 24, range: 200, height: 'projectile', pushback: 30 }
        },
        // Display assets
        portrait: 'assets/characters/ironman/portrait.png',
        thumb: 'assets/characters/ironman/portrait.png'
    },

    'BATMAN': { 
        name: 'BATMAN', 
        title: 'THE DARK KNIGHT',
        archetype: 'TACTICAL',
        rank: 'GOTHAM LEGEND',
        power: 84, 
        speed: 92, 
        defense: 95,
        range: 60,
        color: 0x1a1a2e,
        accent: 0xffd700,
        folder: 'batman',
        specialName: 'BATARANG BARRAGE', 
        specialDamage: 20,
        // AI Personality
        personality: {
            type: 'TACTICAL',
            playStyle: 'COUNTER',
            optimalRange: 75,
            preferredAttacks: ['medium', 'light', 'special'],
            specialUsage: 'REACTIVE',
            movementStyle: 'ADAPTIVE',
            defenseStyle: 'COUNTER_BLOCK',
            comboPreference: 'MEDIUM_START'
        },
        // Attack frame data
        attacks: {
            light: { startup: 75, active: 45, recovery: 150, damage: 6, range: 65, height: 'mid', pushback: 18 },
            medium: { startup: 120, active: 60, recovery: 200, damage: 10, range: 72, height: 'mid', pushback: 28 },
            heavy: { startup: 180, active: 75, recovery: 280, damage: 16, range: 78, height: 'overhead', pushback: 36 },
            special: { startup: 200, active: 90, recovery: 350, damage: 20, range: 160, height: 'projectile', pushback: 25 }
        },
        // Display assets
        portrait: 'assets/characters/batman/portrait.png',
        thumb: 'assets/characters/batman/portrait.png'
    },

    'WOLVERINE': { 
        name: 'WOLVERINE', 
        title: 'THE BEST THERE IS',
        archetype: 'BERSERKER',
        rank: 'X-MEN LEGEND',
        power: 93, 
        speed: 88, 
        defense: 92,
        range: 55,
        color: 0xff8c00,      // Adamantium orange/gold
        accent: 0x0047ab,     // X-Men blue
        folder: 'wolverine',
        specialName: 'BERSERKER BARRAGE', 
        specialDamage: 25,
        // AI Personality
        personality: {
            type: 'BERSERKER',
            playStyle: 'AGGRESSIVE',
            optimalRange: 70,
            preferredAttacks: ['heavy', 'medium', 'light'],
            specialUsage: 'OFFENSIVE',
            movementStyle: 'FORWARD',
            defenseStyle: 'AGGRESSIVE_BLOCK',
            comboPreference: 'HEAVY_START'
        },
        // Attack frame data
        attacks: {
            light: { startup: 70, active: 40, recovery: 140, damage: 7, range: 68, height: 'mid', pushback: 20 },
            medium: { startup: 110, active: 55, recovery: 190, damage: 11, range: 74, height: 'overhead', pushback: 30 },
            heavy: { startup: 170, active: 70, recovery: 260, damage: 17, range: 80, height: 'low', pushback: 38 },
            special: { startup: 220, active: 90, recovery: 380, damage: 25, range: 85, height: 'mid', pushback: 45 }
        },
        // Display assets
        portrait: 'assets/characters/wolverine/portrait.png',
        thumb: 'assets/characters/wolverine/portrait.png'
    }
};

// Helper function to get fighter by name
function getFighter(name) {
    return FIGHTERS[name] || FIGHTERS['ADARSHA'];
}

// Get all fighter names for roster display
function getAllFighterNames() {
    return Object.keys(FIGHTERS);
}

// Get random CPU fighter (excluding player's choice)
function getRandomCPU(playerFighter) {
    const allFighters = getAllFighterNames();
    const availableCPUs = allFighters.filter(f => f !== playerFighter);
    return availableCPUs[Math.floor(Math.random() * availableCPUs.length)];
}