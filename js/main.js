/**
 * IRON FIST - Main Landing Page Scripts
 */

// Smooth scroll to top function
function scrollToHome() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Parallax effect for hero image
document.addEventListener('DOMContentLoaded', () => {
  const heroImg = document.querySelector('.hero-parallax-img');
  
  if (heroImg) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      heroImg.style.transform = `scale(1.05) translateY(${scrolled * 0.08}px)`;
    });
  }
  
  // Add scale effect to all skew buttons
  const skewBtns = document.querySelectorAll('.skew-btn');
  skewBtns.forEach(btn => {
    btn.addEventListener('mousedown', () => {
      btn.style.transform = 'scale(0.96)';
    });
    btn.addEventListener('mouseup', () => {
      btn.style.transform = 'scale(1)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
    });
  });
  
  // Glass panel hover effect
  const glassPanels = document.querySelectorAll('.glass-panel');
  glassPanels.forEach(panel => {
    panel.addEventListener('mouseenter', () => {
      panel.style.borderColor = 'rgba(255,179,178,0.4)';
    });
    panel.addEventListener('mouseleave', () => {
      panel.style.borderColor = 'rgba(255,179,178,0.15)';
    });
  });
});

// Watch Trailer Alert (Demo)
const watchTrailerBtn = document.querySelector('button:has(.skew-btn) + button');
if (watchTrailerBtn) {
  watchTrailerBtn.addEventListener('click', () => {
    alert('🎬 TRAILER COMING SOON! Prepare for the ultimate combat experience.');
  });
}