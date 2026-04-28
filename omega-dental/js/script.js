/* Omega Dental — shared scripts */
(function () {
  'use strict';

  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      if (window.scrollY > 20) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const navBackdrop = document.getElementById('navBackdrop');

  function closeMenu() {
    if (!hamburger || !navLinks) return;
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    if (navBackdrop) navBackdrop.classList.remove('open');
    document.body.classList.remove('nav-open');
  }

  function openMenu() {
    if (!hamburger || !navLinks) return;
    hamburger.classList.add('active');
    navLinks.classList.add('open');
    if (navBackdrop) navBackdrop.classList.add('open');
    document.body.classList.add('nav-open');
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) closeMenu();
      else openMenu();
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
    if (navBackdrop) {
      navBackdrop.addEventListener('click', closeMenu);
    }
  }

  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const parent = entry.target.parentElement;
          const siblings = parent ? [...parent.children].filter(el => el.classList.contains('reveal')) : [];
          const delay = siblings.indexOf(entry.target) * 80;
          setTimeout(() => entry.target.classList.add('visible'), Math.min(delay, 400));
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#' || targetId.length < 2) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  if (form && note) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      note.className = 'form-note';
      note.textContent = '';
      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const phone = (data.get('phone') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const service = (data.get('service') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();

      if (!name || !phone) {
        note.textContent = 'Please enter your name and phone number.';
        note.classList.add('error');
        return;
      }

      // Build WhatsApp message from form fields
      let parts = [];
      parts.push(`Name: ${name}`);
      parts.push(`Phone: ${phone}`);
      if (email) parts.push(`Email: ${email}`);
      if (service) parts.push(`Service: ${service}`);

      let waText = `Hi Omega Dental, ${parts.join(', ')}`;
      if (message) waText += `. Message: ${message}`;

      const waNumber = '918129078711';
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;

      note.textContent = 'Opening WhatsApp...';
      note.classList.add('success');
      window.open(waUrl, '_blank');
      setTimeout(() => form.reset(), 400);
    });
  }

  const heroImg = document.querySelector('.hero-img-wrap img');
  if (heroImg && window.matchMedia('(min-width: 969px)').matches) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < 600) {
        heroImg.style.transform = `translateY(${scrolled * 0.05}px)`;
      }
    }, { passive: true });
  }

  // Before / After slider — performance-tuned for mobile
  document.querySelectorAll('.ba-slider').forEach(slider => {
    const after = slider.querySelector('.ba-img-after');
    const handle = slider.querySelector('.ba-handle');
    if (!after || !handle) return;

    let isDragging = false;
    let pendingX = null;
    let rafId = null;
    let rect = null;

    // Initialize handle position at 50%
    let lastWidth = 0;
    const initHandle = () => {
      rect = slider.getBoundingClientRect();
      lastWidth = rect.width;
      handle.style.transform = `translate3d(${rect.width / 2}px, 0, 0)`;
    };
    initHandle();
    window.addEventListener('resize', initHandle, { passive: true });

    const applyPosition = () => {
      rafId = null;
      if (pendingX === null || !rect) return;
      let pct = ((pendingX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      const px = (pct / 100) * rect.width;
      after.style.clipPath = `inset(0 0 0 ${pct}%)`;
      after.style.webkitClipPath = `inset(0 0 0 ${pct}%)`;
      handle.style.transform = `translate3d(${px}px, 0, 0)`;
    };

    const queueUpdate = (clientX) => {
      pendingX = clientX;
      if (rafId === null) {
        rafId = requestAnimationFrame(applyPosition);
      }
    };

    const start = (e) => {
      isDragging = true;
      rect = slider.getBoundingClientRect();
      slider.style.cursor = 'grabbing';
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      queueUpdate(x);
      if (!e.touches) e.preventDefault();
    };
    const move = (e) => {
      if (!isDragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      queueUpdate(x);
    };
    const end = () => {
      isDragging = false;
      slider.style.cursor = 'ew-resize';
    };

    slider.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mouseup', end);

    slider.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('touchend', end);

    // Tap-to-jump (only on actual click, not drag end)
    slider.addEventListener('click', (e) => {
      rect = slider.getBoundingClientRect();
      queueUpdate(e.clientX);
    });
  });
})();
