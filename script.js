/**
 * KIRA LP3 — Unified Script
 * Merges lux_KIRA-LP2 (count-up, 0.2x parallax) + KIRA-LP (card tilt, stagger fade)
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initFadeInAnimations();
  initSmoothScroll();
  initParallaxHero();
  initCardTilt();
  initMouseGlow();
  initCountUp();
});

/* ── Header scroll effect ── */
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Mobile hamburger menu ── */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('headerNav');
  if (!hamburger || !nav) return;

  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close on nav link click
  nav.querySelectorAll('.header__nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
    });
  });
}

/* ── Fade-in animations with stagger (KIRA-LP style) ── */
function initFadeInAnimations() {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const siblings = Array.from(el.parentElement.querySelectorAll('.fade-in:not(.visible)'));
        const index = siblings.indexOf(el);
        setTimeout(() => {
          el.classList.add('visible');
        }, index * 80);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ── Smooth scroll for anchor links ── */
function initSmoothScroll() {
  const headerHeight = parseInt(getComputedStyle(document.documentElement)
    .getPropertyValue('--header-height')) || 76;

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ── Parallax hero (lux version — 0.2x, gentler) ── */
function initParallaxHero() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  // Disable on mobile (background-attachment: scroll)
  const mq = window.matchMedia('(max-width: 768px)');
  if (mq.matches) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        const heroInner = hero.querySelector('.hero__inner');
        if (heroInner) {
          heroInner.style.transform = `translateY(${scrolled * 0.12}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ── Card tilt on mouse move (KIRA-LP style) ── */
function initCardTilt() {
  const cards = document.querySelectorAll('.step-card, .case-card, .tech-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-3px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ── Mouse glow follow (merged — both section types) ── */
function initMouseGlow() {
  const sections = document.querySelectorAll('.section--dark, .section--alt, .section--cta, .hero');

  sections.forEach(section => {
    const glow = document.createElement('div');
    glow.style.cssText = `
      position: absolute;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(42,169,156,0.07) 0%, transparent 70%);
      pointer-events: none;
      transform: translate(-50%, -50%);
      transition: opacity 0.4s ease;
      opacity: 0;
      z-index: 0;
    `;

    if (getComputedStyle(section).position === 'static') {
      section.style.position = 'relative';
    }
    section.appendChild(glow);

    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      glow.style.left = `${e.clientX - rect.left}px`;
      glow.style.top = `${e.clientY - rect.top}px`;
      glow.style.opacity = '1';
    }, { passive: true });

    section.addEventListener('mouseleave', () => {
      glow.style.opacity = '0';
    });
  });
}

/* ── Count-up animation for hero stats (lux style) ── */
function initCountUp() {
  const statNums = document.querySelectorAll('.hero__stat-num[data-count]');
  if (!statNums.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1200;
      const start = performance.now();

      const tick = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        el.innerHTML = `${current}<span class="hero__stat-unit">${suffix}</span>`;
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => observer.observe(el));
}

