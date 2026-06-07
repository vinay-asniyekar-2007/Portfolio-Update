/* ══════════════════════════════════════════════
   VINAY ASNIYEKAR — PORTFOLIO JS
   ══════════════════════════════════════════════ */

/* ─── LIQUID GLASS CURSOR ─────────────────────── */
// Remove old cursor elements from HTML if they exist
['cursorDot','cursorRing'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.remove();
});

// Create single liquid glass cursor
const cursor = document.createElement('div');
cursor.className = 'liquid-cursor';
document.body.appendChild(cursor);

let mouseX = window.innerWidth  / 2;
let mouseY = window.innerHeight / 2;

// Spring physics state
let curX = mouseX, curY  = mouseY;
let velX = 0,      velY  = 0;
const SPRING  = 0.18;
const DAMPING = 0.72;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Hide when leaving window
document.addEventListener('mouseleave', () => cursor.style.opacity = '0');
document.addEventListener('mouseenter', () => cursor.style.opacity = '1');

// Click squish
document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
document.addEventListener('mouseup',   () => cursor.classList.remove('clicking'));

// Hover state on interactive elements
const interactives = 'a, button, [role="button"], input, textarea, select, label';
document.querySelectorAll(interactives).forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
});
// Watch for future dynamic elements via delegation
document.addEventListener('mouseover', e => {
  if (e.target.matches && e.target.matches(interactives)) cursor.classList.add('hovering');
});
document.addEventListener('mouseout', e => {
  if (e.target.matches && e.target.matches(interactives)) cursor.classList.remove('hovering');
});

function animateCursor() {
  // Spring force
  velX += (mouseX - curX) * SPRING;
  velY += (mouseY - curY) * SPRING;

  // Damping
  velX *= DAMPING;
  velY *= DAMPING;

  curX += velX;
  curY += velY;

  // Liquid stretch — elongates in direction of travel
  const speed   = Math.hypot(velX, velY);
  const stretch = Math.min(speed * 0.045, 0.28);
  const angle   = Math.atan2(velY, velX) * (180 / Math.PI);

  const scaleX = 1 + stretch;
  const scaleY = 1 - stretch * 0.5;

  cursor.style.left = curX + 'px';
  cursor.style.top  = curY + 'px';
  cursor.style.transform =
    `translate(-50%, -50%) rotate(${angle}deg) scaleX(${scaleX}) scaleY(${scaleY})`;

  requestAnimationFrame(animateCursor);
}
animateCursor();

/* ─── PARTICLE CANVAS ─────────────────────────── */
const canvas = document.getElementById('bgCanvas');
const ctx    = canvas.getContext('2d');

let W, H, particles = [], mouse = { x: null, y: null, radius: 180 };

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', () => { resize(); buildParticles(); });
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

const PARTICLE_COUNT  = 90;
const CONNECT_DIST    = 140;
const CYAN_RAW        = [0, 240, 255];
const VIOLET_RAW      = [123, 94, 167];

class Particle {
  constructor() { this.reset(true); }

  reset(init = false) {
    this.x  = Math.random() * W;
    this.y  = init ? Math.random() * H : H + 10;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = -(Math.random() * 0.5 + 0.15);
    this.r  = Math.random() * 1.5 + 0.5;
    this.alpha = Math.random() * 0.5 + 0.1;
    this.pulse = Math.random() * Math.PI * 2;
    this.cyan  = Math.random() > 0.4;
  }

  update() {
    this.pulse += 0.018;
    this.x += this.vx;
    this.y += this.vy;

    // Mouse repel
    if (mouse.x !== null) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.x += dx / dist * force * 1.5;
        this.y += dy / dist * force * 1.5;
      }
    }

    if (this.y < -20 || this.x < -20 || this.x > W + 20) this.reset();
  }

  draw() {
    const a = this.alpha * (0.7 + 0.3 * Math.sin(this.pulse));
    const [r, g, b] = this.cyan ? CYAN_RAW : VIOLET_RAW;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
    ctx.fill();
  }
}

function buildParticles() {
  particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
}
buildParticles();

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx   = particles[i].x - particles[j].x;
      const dy   = particles[i].y - particles[j].y;
      const dist = Math.hypot(dx, dy);
      if (dist < CONNECT_DIST) {
        const a = (1 - dist / CONNECT_DIST) * 0.12;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(0,240,255,${a})`;
        ctx.lineWidth   = 0.6;
        ctx.stroke();
      }
    }
  }
}

// Diagonal grid lines in background
function drawGrid() {
  ctx.save();
  ctx.strokeStyle = 'rgba(0,240,255,0.025)';
  ctx.lineWidth   = 1;
  const step = 80;
  for (let x = -H; x < W + H; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + H, H);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRadialGlow() {
  // Hero glow — only on top portion
  const grad = ctx.createRadialGradient(W / 2, H * 0.45, 0, W / 2, H * 0.45, Math.min(W, H) * 0.55);
  grad.addColorStop(0,   'rgba(0,240,255,0.03)');
  grad.addColorStop(0.5, 'rgba(123,94,167,0.015)');
  grad.addColorStop(1,   'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

function loop() {
  ctx.clearRect(0, 0, W, H);
  drawRadialGlow();
  drawGrid();
  drawConnections();
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(loop);
}
loop();

/* ─── NAVBAR SCROLL ───────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  highlightNav();
});

/* ─── NAV ACTIVE LINK ─────────────────────────── */
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

function highlightNav() {
  const scrollY = window.scrollY + 120;
  sections.forEach(sec => {
    if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${sec.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}

/* ─── HAMBURGER ───────────────────────────────── */
const hamburger    = document.getElementById('hamburger');
const mobileDrawer = document.getElementById('mobileDrawer');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileDrawer.classList.toggle('open');
});
document.querySelectorAll('.mob-link').forEach(l =>
  l.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileDrawer.classList.remove('open');
  })
);

/* ─── TYPEWRITER ──────────────────────────────── */
const lines = [
  'AI-powered assistants.',
  'Python automation tools.',
  'interactive web experiences.',
  'satellite tracking systems.',
  'computer vision projects.',
  'the future.'
];
const tw   = document.getElementById('typewriter');
let li = 0, ci = 0, deleting = false;

function typewrite() {
  const current = lines[li];
  if (!deleting) {
    tw.textContent = current.slice(0, ++ci);
    if (ci === current.length) {
      deleting = true;
      setTimeout(typewrite, 1800);
      return;
    }
    setTimeout(typewrite, 60);
  } else {
    tw.textContent = current.slice(0, --ci);
    if (ci === 0) {
      deleting = false;
      li = (li + 1) % lines.length;
      setTimeout(typewrite, 350);
      return;
    }
    setTimeout(typewrite, 32);
  }
}
setTimeout(typewrite, 700);

/* ─── GLITCH ON HOVER ─────────────────────────── */
const glitchEl = document.getElementById('glitchText');
let glitchInterval;

glitchEl.addEventListener('mouseenter', () => {
  glitchInterval = setInterval(() => {
    glitchEl.classList.add('glitch');
    setTimeout(() => glitchEl.classList.remove('glitch'), 300);
  }, 2200);
});
glitchEl.addEventListener('mouseleave', () => clearInterval(glitchInterval));

// Auto-glitch once on load
setTimeout(() => {
  glitchEl.classList.add('glitch');
  setTimeout(() => glitchEl.classList.remove('glitch'), 350);
}, 1400);

/* ─── SCROLL REVEAL ───────────────────────────── */
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');

      // Animate skill bars when visible
      const fill = entry.target.querySelector('.skill-fill');
      if (fill) {
        const w = fill.getAttribute('data-w');
        setTimeout(() => { fill.style.width = w + '%'; }, 200);
      }
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

revealEls.forEach(el => observer.observe(el));

// Also observe skill cards specifically for bars
document.querySelectorAll('.skill-card').forEach(card => {
  const fillObs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      const fill = card.querySelector('.skill-fill');
      const w    = fill?.getAttribute('data-w');
      if (fill && w) {
        const delay = parseFloat(getComputedStyle(card).getPropertyValue('--delay') || '0') * 1000;
        setTimeout(() => { fill.style.width = w + '%'; }, 400 + delay);
      }
    }
  }, { threshold: 0.3 });
  fillObs.observe(card);
});

/* ─── SMOOTH SCROLL ───────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id  = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ─── SKILL CARD TILT ─────────────────────────── */
document.querySelectorAll('.skill-card, .project-card, .contact-link-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) / (rect.width  / 2);
    const dy   = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `translateY(-4px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg)`;
    card.style.transition = 'transform 0.1s ease';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1), border-color 0.35s, background 0.35s, box-shadow 0.35s';
  });
});

/* ─── PAGE LOAD ENTRANCE ──────────────────────── */
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.6s ease';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { document.body.style.opacity = '1'; });
  });
});
