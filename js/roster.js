/**
 * IRON FIST - Character Roster Page Scripts
 * Complete fighter data & interactive roster grid
 */

// FIGHTER DATABASE - Using actual playable characters
const fighters = [
  { 
    name: "ADARSHA", 
    archetype: "RUSH-DOWN", 
    rank: "ELITE RANK", 
    power: 88, 
    speed: 94, 
    range: 42,
    defense: 78,
    portrait: "assets/characters/adarsha/portrait.png",
    thumb: "assets/characters/adarsha/portrait.png",
    description: "A cybernetic monk who fuses ancient martial arts with experimental combat AI.",
    unlocked: true
  },
  { 
    name: "ASHMIN", 
    archetype: "ZONER", 
    rank: "LEGEND", 
    power: 90, 
    speed: 91, 
    range: 78,
    defense: 75,
    portrait: "assets/characters/ashmin/portrait.jpg",
    thumb: "assets/characters/ashmin/portrait.jpg",
    description: "A synthetic being designed to be the perfect weapon—emotionless, efficient, and deadly.",
    unlocked: true
  },
  { 
    name: "ALPINE", 
    archetype: "BALANCED", 
    rank: "MOUNTAIN MASTER", 
    power: 85, 
    speed: 82, 
    range: 88,
    defense: 88,
    portrait: "assets/characters/alpine/portrait.png",
    thumb: "assets/characters/alpine/portrait.png",
    description: "Born in the frozen peaks, Alpine uses her climbing skills as devastating combat techniques.",
    unlocked: true
  },
  { 
    name: "PRESIDENT", 
    archetype: "POWER", 
    rank: "PRESIDENTIAL RANK", 
    power: 95, 
    speed: 70, 
    range: 65,
    defense: 85,
    portrait: "assets/characters/president/portrait.png",
    thumb: "assets/characters/president/portrait.png",
    description: "A former military general who brings strategic genius and overwhelming force to the arena.",
    unlocked: true
  },
  // UPCOMING FIGHTERS (placeholder for future updates)
  { 
    name: "???", 
    archetype: "COMING SOON", 
    rank: "LOCKED", 
    power: 0, 
    speed: 0, 
    range: 0,
    defense: 0,
    portrait: "https://placehold.co/600x800/2a2a2a/ffb3b2?text=COMING+SOON",
    thumb: "https://placehold.co/200x200/252525/ffb3b2?text=??",
    description: "New fighter arriving in future update!",
    unlocked: false
  },
  { 
    name: "???", 
    archetype: "COMING SOON", 
    rank: "LOCKED", 
    power: 0, 
    speed: 0, 
    range: 0,
    defense: 0,
    portrait: "https://placehold.co/600x800/2a2a2a/ffb3b2?text=COMING+SOON",
    thumb: "https://placehold.co/200x200/252525/ffb3b2?text=??",
    description: "New fighter arriving in future update!",
    unlocked: false
  }
];

// Global variable to track selected fighter
let currentFighter = fighters[0];

// DOM Elements
function updateDetailPanel(fighter) {
  document.getElementById('detail-name').textContent = fighter.name;
  document.getElementById('detail-archetype').innerHTML = `<span class="block skew-box-reverse">${fighter.archetype}</span>`;
  document.getElementById('detail-rank').innerHTML = `<span class="block skew-box-reverse">${fighter.rank}</span>`;
  document.getElementById('detail-portrait').src = fighter.portrait;
  document.getElementById('detail-portrait').alt = fighter.name;
  
  document.getElementById('stat-power-val').textContent = `${fighter.power}%`;
  document.getElementById('stat-speed-val').textContent = `${fighter.speed}%`;
  document.getElementById('stat-range-val').textContent = `${fighter.range}%`;
  document.getElementById('stat-defense-val').textContent = `${fighter.defense}%`;
  
  const powerBar = document.getElementById('stat-power-bar');
  const speedBar = document.getElementById('stat-speed-bar');
  const rangeBar = document.getElementById('stat-range-bar');
  const defenseBar = document.getElementById('stat-defense-bar');
  
  if(powerBar) powerBar.style.width = `${fighter.power}%`;
  if(speedBar) speedBar.style.width = `${fighter.speed}%`;
  if(rangeBar) rangeBar.style.width = `${fighter.range}%`;
  if(defenseBar) defenseBar.style.width = `${fighter.defense}%`;
  
  // Update description text if element exists
  const descElement = document.getElementById('fighter-description');
  if (descElement && fighter.description) {
    descElement.textContent = fighter.description;
  }
}

// Build roster grid
function buildRosterGrid() {
  const grid = document.getElementById('roster-grid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  fighters.forEach((fighter, index) => {
    const card = document.createElement('div');
    card.className = `character-card ${index === 0 ? 'active' : ''}`;
    card.setAttribute('data-fighter-index', index);
    
    // Add locked overlay for upcoming fighters
    const lockedOverlay = !fighter.unlocked ? `
      <div class="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
        <span class="text-primary font-label-bold text-xs uppercase tracking-wider">Coming Soon</span>
      </div>
    ` : '';
    
    card.innerHTML = `
      <div class="scanline absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none"></div>
      ${lockedOverlay}
      <img src="${fighter.thumb}" alt="${fighter.name}" class="w-full h-28 md:h-32 object-cover" />
      <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1">
        <span class="font-label-bold text-[11px] text-primary">${fighter.name}</span>
      </div>
    `;
    
    card.addEventListener('click', () => {
      if (!fighter.unlocked) return; // Can't select locked fighters
      
      document.querySelectorAll('.character-card').forEach(c => {
        c.classList.remove('active');
      });
      card.classList.add('active');
      currentFighter = fighter;
      updateDetailPanel(currentFighter);
    });
    
    grid.appendChild(card);
  });
}

// START FIGHT FUNCTION - Updated to use ADARSHA as default
function startFight() {
  if(currentFighter && currentFighter.unlocked) {
    window.location.href = `arena.html?fighter=${encodeURIComponent(currentFighter.name)}`;
  } else {
    // Default to ADARSHA if no fighter selected or locked
    window.location.href = 'arena.html?fighter=ADARSHA';
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  buildRosterGrid();
  updateDetailPanel(fighters[0]);
  
  // Make sure currentFighter is set to the first fighter
  currentFighter = fighters[0];
  
  // Find the START FIGHT button and attach the function
  const confirmBtn = document.getElementById('confirm-btn');
  if (confirmBtn) {
    // Remove any existing listeners
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
    newBtn.addEventListener('click', startFight);
  }
  
  // Also look for any button with START FIGHT text just in case
  const allButtons = document.querySelectorAll('button');
  allButtons.forEach(btn => {
    if(btn.innerText.includes('START FIGHT') || btn.innerText.includes('CONFIRM') || btn.innerText.includes('SELECT ARENA')) {
      btn.addEventListener('click', startFight);
    }
  });
  
  // Portrait hover effect
  const portraitContainer = document.querySelector('.detail-portrait-container');
  if (portraitContainer) {
    portraitContainer.addEventListener('mousemove', (e) => {
      const rect = portraitContainer.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const img = document.getElementById('detail-portrait');
      if (img) {
        img.style.transform = `scale(1.05) translate(${x * 8}px, ${y * 8}px)`;
      }
    });
    
    portraitContainer.addEventListener('mouseleave', () => {
      const img = document.getElementById('detail-portrait');
      if (img) {
        img.style.transform = 'scale(1) translate(0, 0)';
      }
    });
  }
});