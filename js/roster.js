/**
 * IRON FIST - Character Roster Page Scripts
 * Complete fighter data & interactive roster grid
 */

// Fighter Database (24 warriors)
const fighters = [
  { name: "KAIRO", archetype: "RUSH-DOWN", rank: "ELITE RANK", power: 88, speed: 94, range: 42, portrait: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8LWTb32pZ07IQtIRp7v-LlunjPh_mOR5bTUtCsSDud82DZMez9AZBECC7df1a6tY0yKDqEQYHHxSwLqd9WcB6Ta3BuflS8_fgZxakoWaNVIJdB7J4f5WHUb8ImL9cHvU9uhiDsMwVaQYAozfFhjA7XaIrWGFFSIenGy-NhxKyRC7UskIgfK_M5sfJdO_jDs-RcEunPOHvMIvXD54NbYMXyLRROAbBz0A1IcUywfiuo2BdTDsIJVJHlIR_LmF17kMswpCIJc6qkpM", thumb: "https://lh3.googleusercontent.com/aida-public/AB6AXuDYgiL5dQMQYnYCraG46zlXyvhO9MmeQFdL-Ef-PfRytbC4pp750viAymiUf1IYF87jt4jN0PgYW_WPAOCgqK4bUKsrj1FAWY5vxErAYLeqsUAyz-P0kfcjrK77EJR2SNAycpPnm2NvMKwRfSYofVBWr46jyN1fjcyscilm2tYgBZtQzDhV1jRKiMKjaNEQR9CbJv6azAxNi8kFqFdng6E3dXEDvSnNnrd5WIArg1IKHp2a8SJ0YruPOIinhz2HWQHNPBaEYgIukBc" },
  { name: "SILAS", archetype: "TANK", rank: "MASTER", power: 95, speed: 58, range: 35, portrait: "https://placehold.co/600x800/2a2a2a/ffb3b2?text=SILAS", thumb: "https://placehold.co/200x200/252525/ffb3b2?text=SL" },
  { name: "MIRA", archetype: "TRICKSTER", rank: "DIAMOND", power: 72, speed: 96, range: 68, portrait: "https://placehold.co/600x800/2a2a2a/00dbe9?text=MIRA", thumb: "https://placehold.co/200x200/252525/00dbe9?text=MR" },
  { name: "AXEL", archetype: "BRUISER", rank: "GOLD", power: 91, speed: 67, range: 44, portrait: "https://placehold.co/600x800/2a2a2a/ffb3b2?text=AXEL", thumb: "https://placehold.co/200x200/252525/ffb3b2?text=AX" },
  { name: "NYX", archetype: "ZONER", rank: "PLATINUM", power: 64, speed: 79, range: 92, portrait: "https://placehold.co/600x800/2a2a2a/00dbe9?text=NYX", thumb: "https://placehold.co/200x200/252525/00dbe9?text=NY" },
  { name: "KODEX", archetype: "TECH", rank: "MASTER", power: 84, speed: 88, range: 77, portrait: "https://placehold.co/600x800/2a2a2a/ffb3b2?text=KODEX", thumb: "https://placehold.co/200x200/252525/ffb3b2?text=KD" },
  { name: "DRAKE", archetype: "RUSH-DOWN", rank: "ELITE", power: 86, speed: 92, range: 48, portrait: "https://placehold.co/600x800/2a2a2a/ffb3b2?text=DRAKE", thumb: "https://placehold.co/200x200/252525/ffb3b2?text=DR" },
  { name: "VAL", archetype: "ASSASSIN", rank: "DIAMOND", power: 78, speed: 98, range: 52, portrait: "https://placehold.co/600x800/2a2a2a/00dbe9?text=VAL", thumb: "https://placehold.co/200x200/252525/00dbe9?text=VA" },
  { name: "BANE", archetype: "JUGGERNAUT", rank: "GOLD", power: 97, speed: 42, range: 33, portrait: "https://placehold.co/600x800/2a2a2a/ffb3b2?text=BANE", thumb: "https://placehold.co/200x200/252525/ffb3b2?text=BN" },
  { name: "VOLT", archetype: "SPEEDSTER", rank: "PLATINUM", power: 69, speed: 97, range: 61, portrait: "https://placehold.co/600x800/2a2a2a/00dbe9?text=VOLT", thumb: "https://placehold.co/200x200/252525/00dbe9?text=VT" },
  { name: "JADE", archetype: "STRATEGIST", rank: "MASTER", power: 73, speed: 85, range: 89, portrait: "https://placehold.co/600x800/2a2a2a/ffb3b2?text=JADE", thumb: "https://placehold.co/200x200/252525/ffb3b2?text=JD" },
  { name: "ORION", archetype: "RANGED", rank: "DIAMOND", power: 81, speed: 74, range: 94, portrait: "https://placehold.co/600x800/2a2a2a/00dbe9?text=ORION", thumb: "https://placehold.co/200x200/252525/00dbe9?text=OR" },
  { name: "STORM", archetype: "ZONER", rank: "ELITE", power: 67, speed: 83, range: 96, portrait: "https://placehold.co/600x800/2a2a2a/ffb3b2?text=STORM", thumb: "https://placehold.co/200x200/252525/ffb3b2?text=ST" },
  { name: "ZERO", archetype: "CYBER", rank: "LEGEND", power: 90, speed: 91, range: 78, portrait: "https://placehold.co/600x800/2a2a2a/00dbe9?text=ZERO", thumb: "https://placehold.co/200x200/252525/00dbe9?text=ZR" },
  { name: "PYRO", archetype: "BURST", rank: "GOLD", power: 93, speed: 70, range: 59, portrait: "https://placehold.co/600x800/2a2a2a/ffb3b2?text=PYRO", thumb: "https://placehold.co/200x200/252525/ffb3b2?text=PY" },
  { name: "NEO", archetype: "TECH", rank: "PLATINUM", power: 79, speed: 87, range: 85, portrait: "https://placehold.co/600x800/2a2a2a/00dbe9?text=NEO", thumb: "https://placehold.co/200x200/252525/00dbe9?text=NO" },
  { name: "SAGE", archetype: "SUPPORT", rank: "MASTER", power: 62, speed: 75, range: 90, portrait: "https://placehold.co/600x800/2a2a2a/ffb3b2?text=SAGE", thumb: "https://placehold.co/200x200/252525/ffb3b2?text=SG" },
  { name: "VEX", archetype: "TRICKSTER", rank: "DIAMOND", power: 75, speed: 93, range: 71, portrait: "https://placehold.co/600x800/2a2a2a/00dbe9?text=VEX", thumb: "https://placehold.co/200x200/252525/00dbe9?text=VX" },
  { name: "RHINO", archetype: "TANK", rank: "GOLD", power: 96, speed: 49, range: 38, portrait: "https://placehold.co/600x800/2a2a2a/ffb3b2?text=RHINO", thumb: "https://placehold.co/200x200/252525/ffb3b2?text=RH" },
  { name: "TITAN", archetype: "JUGGERNAUT", rank: "ELITE", power: 98, speed: 45, range: 40, portrait: "https://placehold.co/600x800/2a2a2a/00dbe9?text=TITAN", thumb: "https://placehold.co/200x200/252525/00dbe9?text=TT" },
  { name: "BLADE", archetype: "ASSASSIN", rank: "PLATINUM", power: 84, speed: 96, range: 49, portrait: "https://placehold.co/600x800/2a2a2a/ffb3b2?text=BLADE", thumb: "https://placehold.co/200x200/252525/ffb3b2?text=BD" },
  { name: "WOLF", archetype: "RUSH-DOWN", rank: "DIAMOND", power: 87, speed: 94, range: 47, portrait: "https://placehold.co/600x800/2a2a2a/00dbe9?text=WOLF", thumb: "https://placehold.co/200x200/252525/00dbe9?text=WF" },
  { name: "VIPER", archetype: "SPEEDSTER", rank: "MASTER", power: 70, speed: 99, range: 60, portrait: "https://placehold.co/600x800/2a2a2a/ffb3b2?text=VIPER", thumb: "https://placehold.co/200x200/252525/ffb3b2?text=VP" },
  { name: "GHOST", archetype: "STEALTH", rank: "LEGEND", power: 76, speed: 97, range: 82, portrait: "https://placehold.co/600x800/2a2a2a/00dbe9?text=GHOST", thumb: "https://placehold.co/200x200/252525/00dbe9?text=GH" }
];

// DOM Elements
let currentFighter = fighters[0];

// Update detail panel with fighter data
function updateDetailPanel(fighter) {
  // Update text content
  document.getElementById('detail-name').textContent = fighter.name;
  document.getElementById('detail-archetype').innerHTML = `<span class="block skew-box-reverse">${fighter.archetype}</span>`;
  document.getElementById('detail-rank').innerHTML = `<span class="block skew-box-reverse">${fighter.rank}</span>`;
  document.getElementById('detail-portrait').src = fighter.portrait;
  document.getElementById('detail-portrait').alt = fighter.name;
  
  // Update stats
  document.getElementById('stat-power-val').textContent = `${fighter.power}%`;
  document.getElementById('stat-speed-val').textContent = `${fighter.speed}%`;
  document.getElementById('stat-range-val').textContent = `${fighter.range}%`;
  
  // Update bars with animation
  const powerBar = document.getElementById('stat-power-bar');
  const speedBar = document.getElementById('stat-speed-bar');
  const rangeBar = document.getElementById('stat-range-bar');
  
  powerBar.style.width = `${fighter.power}%`;
  speedBar.style.width = `${fighter.speed}%`;
  rangeBar.style.width = `${fighter.range}%`;
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
    
    card.innerHTML = `
      <div class="scanline absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none"></div>
      <img src="${fighter.thumb}" alt="${fighter.name}" class="w-full h-28 md:h-32 object-cover" />
      <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1">
        <span class="font-label-bold text-[11px] text-primary">${fighter.name}</span>
      </div>
    `;
    
    card.addEventListener('click', () => {
      // Remove active class from all cards
      document.querySelectorAll('.character-card').forEach(c => {
        c.classList.remove('active');
      });
      // Add active class to clicked card
      card.classList.add('active');
      // Update current fighter and detail panel
      currentFighter = fighter;
      updateDetailPanel(currentFighter);
    });
    
    grid.appendChild(card);
  });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  buildRosterGrid();
  updateDetailPanel(fighters[0]);
  
  // Confirm button handler
  const confirmBtn = document.getElementById('confirm-btn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      alert(`⚔️ FIGHTER CONFIRMED: ${currentFighter.name} is ready for battle!\n\nArchetype: ${currentFighter.archetype}\nPower: ${currentFighter.power}% | Speed: ${currentFighter.speed}% | Range: ${currentFighter.range}%\n\nEnter the arena and forge your legacy! ⚔️`);
    });
  }
  
  // Add hover effect for portrait container
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