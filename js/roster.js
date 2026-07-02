/**
 * IRON FIST - Character Roster Page Scripts
 * Complete fighter data & interactive roster grid
 */

// FIGHTER DATABASE - Dynamically loaded from fighters.js
// Read fighters dynamically from fighters.js (must be loaded before this script)
const fighters = Object.values(FIGHTERS).map(f => ({
    name: f.name,
    archetype: f.archetype,
    rank: f.rank,
    power: f.power,
    speed: f.speed,
    range: f.range,
    defense: f.defense,
    portrait: f.portrait,
    thumb: f.thumb,
    description: f.title + ' — ' + f.archetype + ' archetype fighter.',
    unlocked: true
}));

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