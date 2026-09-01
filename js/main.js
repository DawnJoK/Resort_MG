/* ═══════════════════════════════════════════════════════════════
   SERENITY SHORES — Luxury Lodge & Resort Collection
   Architecture: Standalone Brand Stage, Parallax & DailyUI 067
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  document.body.classList.remove('no-scroll');

  // ─── ERA RESIDENCE SIGNATURE INITIAL TRANSITION ─────────────
  function initEraPreloader() {
    const preloader = document.getElementById('eraPreloader');
    if (!preloader) return;

    const emblem    = preloader.querySelector('.era-preloader__emblem-wrap');
    const sideLeft  = preloader.querySelector('.era-preloader__side-tag--left');
    const sideRight = preloader.querySelector('.era-preloader__side-tag--right');
    const chars     = preloader.querySelectorAll('.era-char');
    const subtag    = preloader.querySelector('.era-preloader__subtag');
    const bottom    = preloader.querySelector('.era-preloader__bottom');
    const progressFill = document.getElementById('eraProgressFill');
    const heroBg    = document.querySelector('.hero__parallax-bg') || document.querySelector('.brand-stage__bg');
    const navbar    = document.getElementById('navbar');

    document.body.classList.add('no-scroll');

    // Disable automatic browser scroll restoration on reload
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Use GSAP if available
    if (typeof gsap !== 'undefined') {
      if (heroBg) {
        gsap.set(heroBg, { scale: 1.16, transformOrigin: 'center center' });
      }
      if (navbar) {
        gsap.set(navbar, { y: -30, opacity: 0 });
      }

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' }
      });

      // 01. Star & Top Emblem Reveal
      tl.to(emblem, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        delay: 0.15
      });

      // 02. Center 3D Character Split Reveal (Era Residence Style)
      tl.to(chars, {
        opacity: 1,
        y: 0,
        rotateY: 0,
        rotateX: 0,
        duration: 0.85,
        stagger: 0.035,
        ease: 'back.out(1.4)'
      }, '-=0.35');

      // 03. Side tags and sub-badge reveal
      tl.to([sideLeft, sideRight], {
        opacity: 1,
        x: 0,
        duration: 0.6
      }, '-=0.45');

      tl.to(subtag, {
        opacity: 1,
        y: 0,
        duration: 0.6
      }, '-=0.45');

      // 04. Bottom Progress Bar & Statement
      tl.to(bottom, {
        opacity: 1,
        y: 0,
        duration: 0.5
      }, '-=0.35');

      // 05. Progress Fill sweep (0% -> 100%)
      tl.to(progressFill, {
        width: '100%',
        duration: 1.3,
        ease: 'power2.inOut'
      }, '-=0.2');

      // 06. THE ERA RESIDENCE SIGNATURE ARCH REVEAL / OPENING TRANSITION
      tl.add(() => {
        // Position viewport directly at #hero while preloader is still covering
        const hero = document.getElementById('hero');
        if (hero) {
          const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 84;
          const top = hero.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo(0, top);
        }
        preloader.classList.add('revealing');
      }, '+=0.15');

      // 07. Hero Image Zoom-out Settling & Navbar Slide-in
      if (heroBg) {
        tl.to(heroBg, {
          scale: 1,
          duration: 1.25,
          ease: 'power2.inOut'
        }, '-=0.25');
      }

      if (navbar) {
        tl.to(navbar, {
          y: 0,
          opacity: 1,
          duration: 0.75,
          ease: 'power2.out'
        }, '-=0.55');
      }

      // 08. Complete Preloader
      tl.add(() => {
        document.body.classList.remove('no-scroll');
        preloader.classList.add('done');
        revealOnScroll();
      }, '+=0.3');
    } else {
      // Graceful fallback
      setTimeout(() => {
        const hero = document.getElementById('hero');
        if (hero) {
          const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 84;
          const top = hero.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo(0, top);
        }
        preloader.classList.add('revealing');
        setTimeout(() => {
          document.body.classList.remove('no-scroll');
          preloader.classList.add('done');
        }, 1250);
      }, 2000);
    }
  }

  // ─── INITIAL AUTO-SLIDE FROM BRAND STAGE TO HERO ─────────────
  let autoSlideTimer = null;
  let hasUserInteracted = false;

  function cancelAutoSlide() {
    hasUserInteracted = true;
    if (autoSlideTimer) {
      clearTimeout(autoSlideTimer);
      autoSlideTimer = null;
    }
  }

  window.addEventListener('load', () => {
    initEraPreloader();
  });

  // Cancel auto-slide if user scrolls, touches, or presses keys
  window.addEventListener('wheel', cancelAutoSlide, { passive: true, once: true });
  window.addEventListener('touchstart', cancelAutoSlide, { passive: true, once: true });
  window.addEventListener('keydown', cancelAutoSlide, { passive: true, once: true });

  // ─── SCROLL-DRIVEN & PARALLAX ENGINE (60fps rAF) ─────────────
  const progressBar        = document.getElementById('scrollProgressBar');
  const brandStage         = document.getElementById('brand-stage');
  const brandContent       = brandStage ? brandStage.querySelector('.brand-stage__content') : null;
  const heroSection        = document.getElementById('hero');
  const heroBg             = heroSection ? heroSection.querySelector('.hero__parallax-bg') : null;
  const experienceBadge    = document.querySelector('.about__experience-badge');
  const parallaxBgElements = document.querySelectorAll('[data-parallax]');
  const parallaxLayers     = document.querySelectorAll('[data-parallax-layer]');
  const parallaxWatermarks = document.querySelectorAll('[data-parallax-text]');
  const parallaxOrbs       = document.querySelectorAll('[data-parallax-speed]');
  const amenityCards       = document.querySelectorAll('.amenity-card');
  const navbar             = document.getElementById('navbar');
  const fab                = document.getElementById('fabWhatsapp');
  const allNavLinks        = document.querySelectorAll('.navbar__link');

  let latestScrollY = 0;
  let currentScrollY = 0;
  let isTicking = false;

  function onScrollTick() {
    latestScrollY = window.scrollY;
    if (!isTicking) {
      requestAnimationFrame(runScrollDrivenAnimations);
      isTicking = true;
    }
  }

  // ─── CACHED LAYOUT METRICS (ZERO FORCED REFLOWS) ─────────────
  let cachedParallaxBg = [];
  let cachedHeroTop = 0;
  let cachedDocHeight = 0;
  let cachedViewHeight = window.innerHeight;
  let cachedSections = [];

  function updateCachedMetrics() {
    cachedViewHeight = window.innerHeight;
    cachedDocHeight = document.documentElement.scrollHeight - cachedViewHeight;
    if (heroSection) cachedHeroTop = heroSection.offsetTop;

    cachedParallaxBg = [];
    parallaxBgElements.forEach(el => {
      if (el === heroBg) return;
      const parent = el.parentElement;
      if (parent) {
        cachedParallaxBg.push({
          el,
          speed: parseFloat(el.dataset.parallax) || 0.3,
          offsetTop: parent.offsetTop
        });
      }
    });

    const allSections = document.querySelectorAll('section[id], footer[id]');
    cachedSections = Array.from(allSections).map(section => ({
      id: section.getAttribute('id'),
      top: section.offsetTop,
      height: section.offsetHeight
    }));
  }

  window.addEventListener('load', updateCachedMetrics);
  window.addEventListener('resize', updateCachedMetrics, { passive: true });
  updateCachedMetrics();

  function getCurrentSectionId(scrollPos = (latestScrollY + cachedViewHeight / 3)) {
    for (let i = 0; i < cachedSections.length; i++) {
      const sec = cachedSections[i];
      if (scrollPos >= sec.top && scrollPos < sec.top + sec.height) {
        return sec.id;
      }
    }
    return null;
  }

  function runScrollDrivenAnimations() {
    currentScrollY += (latestScrollY - currentScrollY) * 0.35;
    if (Math.abs(latestScrollY - currentScrollY) < 0.1) {
      currentScrollY = latestScrollY;
    }

    const scrollY = currentScrollY;
    const viewHeight = cachedViewHeight;
    const docHeight = cachedDocHeight;

    // 1. Top Global Progress Bar
    if (progressBar && docHeight > 0) {
      const scrollPct = Math.min(Math.max((scrollY / docHeight) * 100, 0), 100);
      progressBar.style.width = `${scrollPct.toFixed(2)}%`;
    }

    // 2. Parallax Drift on Top Brand Stage Content
    if (brandContent && scrollY < viewHeight * 1.2) {
      const driftY = scrollY * 0.35;
      const driftOpacity = Math.max(1 - (scrollY / (viewHeight * 0.8)), 0);
      brandContent.style.transform = `translate3d(0, ${driftY.toFixed(2)}px, 0)`;
      brandContent.style.opacity = driftOpacity.toFixed(2);
    }

    // 3. Parallax on Hero Section Background
    if (heroBg && heroSection && scrollY < viewHeight * 2.5) {
      const offset = (scrollY - cachedHeroTop) * 0.22;
      heroBg.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    }

    // 4. Continuous Experience Badge Rotation
    if (experienceBadge) {
      const rotAngle = (scrollY * 0.18) % 360;
      experienceBadge.style.transform = `translateX(-50%) rotate(${rotAngle.toFixed(1)}deg)`;
    }

    // 5. Parallax Background Windows (Cached Zero Reflow)
    cachedParallaxBg.forEach(item => {
      const offset = (scrollY - item.offsetTop) * item.speed;
      item.el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    });

    // 6. Watermark Typography Drift
    parallaxWatermarks.forEach(el => {
      const speed = parseFloat(el.dataset.parallaxText) || 0.1;
      const translateVal = scrollY * speed * -0.2;
      el.style.transform = `translate3d(-50%, ${translateVal.toFixed(2)}px, 0)`;
    });

    // 7. Ambient Glow Orbs Drift
    parallaxOrbs.forEach(orb => {
      const speed = parseFloat(orb.dataset.parallaxSpeed) || 0.1;
      const translateVal = scrollY * speed;
      orb.style.transform = `translate3d(0, ${translateVal.toFixed(2)}px, 0)`;
    });

    // Sticky Nav State & Floating WhatsApp Button
    if (navbar) navbar.classList.toggle('scrolled', scrollY > 60);
    if (fab) fab.classList.toggle('visible', scrollY > 350);

    updateActiveLink();

    if (Math.abs(latestScrollY - currentScrollY) > 0.1) {
      requestAnimationFrame(runScrollDrivenAnimations);
    } else {
      isTicking = false;
    }
  }

  window.addEventListener('scroll', onScrollTick, { passive: true });
  onScrollTick();

  // ═══════════════════════════════════════════════════════════════
  // 04. 3D GLOBE PROPERTIES SHOWCASE (GETLAYERS AI STUDIO STYLE)
  // ═══════════════════════════════════════════════════════════════
  const globeStageWrapper     = document.getElementById('globeStageWrapper');
  const globeViewport         = document.getElementById('globeViewport');
  const globeRing             = document.getElementById('globeRing');
  const globeCards            = document.querySelectorAll('.globe-card');
  const globeTabs             = document.querySelectorAll('.globe-tab');
  const globePrevBtn          = document.getElementById('globePrevBtn');
  const globeNextBtn          = document.getElementById('globeNextBtn');
  const propertiesSection     = document.getElementById('properties');

  // Modal elements
  const propertyModal         = document.getElementById('propertyModal');
  const propertyModalBackdrop = document.getElementById('propertyModalBackdrop');
  const modalCloseBtn         = document.getElementById('modalCloseBtn');
  const modalNavPills         = document.querySelectorAll('.modal-nav-pill');
  const propertyPanels        = document.querySelectorAll('.property-modal .property-panel');
  const modalPrevPropBtn      = document.getElementById('modalPrevPropBtn');
  const modalNextPropBtn      = document.getElementById('modalNextPropBtn');
  const modalCycleIndicator   = document.getElementById('modalCycleIndicator');

  const panelToNavMap = {
    'prop-azure':   'azure-cliff',
    'prop-emerald': 'emerald-canopy',
    'prop-golden':  'golden-sands'
  };

  const propNavMap = {
    'azure-cliff':    'prop-azure',
    'emerald-canopy': 'prop-emerald',
    'golden-sands':   'prop-golden'
  };

  const propertyIds = ['prop-azure', 'prop-emerald', 'prop-golden'];

  // ─── 3D CYLINDER GEOMETRY & LAYOUT ────────────────────────────
  const totalCards = globeCards.length;
  const angleStep = 360 / totalCards;
  let cylinderRadius = 450;

  function updateCylinderRadius() {
    const w = window.innerWidth;
    if (w < 480) {
      cylinderRadius = 260;
    } else if (w < 768) {
      cylinderRadius = 310;
    } else if (w < 1024) {
      cylinderRadius = 380;
    } else {
      cylinderRadius = 460;
    }

    globeCards.forEach((card, i) => {
      const cardAngle = i * angleStep;
      card.dataset.angle = cardAngle;
      card.style.transform = `rotateY(${cardAngle}deg) translateZ(${cylinderRadius}px)`;
    });
  }

  updateCylinderRadius();
  window.addEventListener('resize', updateCylinderRadius, { passive: true });

  // ─── 3D GLOBE ROTATION & INTERACTION ENGINE ──────────────────
  let currentRotation   = 0;
  let targetRotation    = 0;
  let autoRotateSpeed   = 0.12;
  let isAutoRotating    = true;
  let isDragging        = false;
  let dragStartX        = 0;
  let dragStartRotation = 0;
  let dragDistance      = 0;
  let activePropIndex   = 0;
  let isModalOpen       = false;
  let isGlobeVisible    = true;
  let globeRafId        = null;

  function renderGlobe() {
    if (!isGlobeVisible && !isDragging) {
      globeRafId = null;
      return;
    }

    // Auto-orbit when idle and modal is closed
    if (isAutoRotating && !isDragging && !isModalOpen) {
      targetRotation -= autoRotateSpeed;
    }

    // Inertia & Damping
    currentRotation += (targetRotation - currentRotation) * 0.12;

    if (globeRing) {
      globeRing.style.transform = `rotateY(${currentRotation.toFixed(2)}deg)`;
    }

    // Determine front-facing card and update tabs
    let normalized = ((-currentRotation) % 360 + 360) % 360;
    let closestIndex = Math.round(normalized / angleStep) % totalCards;
    let propertyIndex = closestIndex % 3;

    if (propertyIndex !== activePropIndex && !isDragging) {
      activePropIndex = propertyIndex;
      updateActiveTab(activePropIndex);
    }

    globeRafId = requestAnimationFrame(renderGlobe);
  }

  function startGlobeLoop() {
    if (!globeRafId) {
      globeRafId = requestAnimationFrame(renderGlobe);
    }
  }

  // Optimize: Pause globe loop when properties section is off-screen
  if (propertiesSection && 'IntersectionObserver' in window) {
    const globeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isGlobeVisible = entry.isIntersecting;
        if (isGlobeVisible) {
          startGlobeLoop();
        }
      });
    }, { rootMargin: '200px 0px' });
    globeObserver.observe(propertiesSection);
  } else {
    startGlobeLoop();
  }

  function updateActiveTab(index) {
    const targetId = propertyIds[index];
    globeTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.target === targetId);
    });

    const currentSectionId = getCurrentSectionId();
    if (currentSectionId === 'properties') {
      allNavLinks.forEach(link => link.classList.remove('active'));
      const activePropKey = panelToNavMap[targetId];
      const activeLink = document.querySelector(`.navbar__link[data-prop="${activePropKey}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  }

  // ─── DRAG & TOUCH SWIPE (POINTER EVENTS) ─────────────────────
  let isPointerDown = false;
  let pointerDownX = 0;
  let pointerDownY = 0;
  let pointerDownTime = 0;
  let potentialClickedCard = null;

  if (globeStageWrapper) {
    globeStageWrapper.addEventListener('pointerdown', (e) => {
      isPointerDown = true;
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
      pointerDownTime = performance.now();
      dragStartX = e.clientX;
      dragStartRotation = targetRotation;
      dragDistance = 0;
      isDragging = false;
      potentialClickedCard = e.target.closest('.globe-card');
    });

    globeStageWrapper.addEventListener('pointermove', (e) => {
      if (!isPointerDown) return; // Do not rotate on simple cursor hover

      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - pointerDownY;
      const dist = Math.hypot(deltaX, deltaY);

      if (!isDragging) {
        // Only enter active drag mode if user moved > 6px and movement is predominantly horizontal
        if (dist > 6) {
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            isDragging = true;
            isAutoRotating = false;
            globeStageWrapper.classList.add('is-dragging');
            try { globeStageWrapper.setPointerCapture(e.pointerId); } catch(err) {}
          } else {
            // Vertical movement - do not drag cards, let page scroll naturally
            isPointerDown = false;
            return;
          }
        }
      }

      if (isDragging) {
        dragDistance = dist;
        const sensitivity = 0.38;
        targetRotation = dragStartRotation + (deltaX * sensitivity);
      }
    });

    const endDragOrClick = (e) => {
      if (!isPointerDown) return;
      isPointerDown = false;

      const elapsed = performance.now() - pointerDownTime;
      const totalMoved = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);

      if (isDragging) {
        isDragging = false;
        globeStageWrapper.classList.remove('is-dragging');
        try { globeStageWrapper.releasePointerCapture(e.pointerId); } catch(err) {}

        // Snap to nearest card position smoothly
        const snapped = Math.round(targetRotation / angleStep) * angleStep;
        targetRotation = snapped;

        setTimeout(() => {
          if (!isModalOpen) isAutoRotating = true;
        }, 2500);
      } else if (totalMoved <= 8 && elapsed < 800) {
        // Direct click on any part of the card
        const card = potentialClickedCard || e.target.closest('.globe-card');
        if (card) {
          const targetId = card.dataset.target || 'prop-azure';
          const propIdx = parseInt(card.dataset.index) || 0;
          rotateToPropertyIndex(propIdx);
          openPropertyModal(targetId);
        }
      }

      potentialClickedCard = null;
    };

    globeStageWrapper.addEventListener('pointerup', endDragOrClick);
    globeStageWrapper.addEventListener('pointercancel', endDragOrClick);

    // ─── HORIZONTAL WHEEL / SCROLL INTERACTION (PROPERTY CARDS ONLY) ─
    let wheelSnapTimer = null;
    globeStageWrapper.addEventListener('wheel', (e) => {
      if (isModalOpen) return;

      // If user is scrolling vertically without Shift, ignore completely
      // so the page/window scrolls through vertically with zero interference.
      if (!e.shiftKey && Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
        return;
      }

      // Extract horizontal delta (trackpad horizontal swipe or Shift+Wheel)
      let deltaHoriz = 0;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        deltaHoriz = e.deltaX;
      } else if (e.shiftKey && Math.abs(e.deltaY) > 0.5) {
        deltaHoriz = e.deltaY;
      }

      if (Math.abs(deltaHoriz) > 0.5) {
        if (e.cancelable) e.preventDefault();
        isAutoRotating = false;
        // Horizontal scroll spins the 3D cylinder
        targetRotation -= deltaHoriz * 0.42;

        clearTimeout(wheelSnapTimer);
        wheelSnapTimer = setTimeout(() => {
          // Snap smoothly to nearest card
          const snapped = Math.round(targetRotation / angleStep) * angleStep;
          targetRotation = snapped;

          setTimeout(() => {
            if (!isModalOpen) isAutoRotating = true;
          }, 2500);
        }, 160);
      }
    }, { passive: false });
  }

  // ─── PREV / NEXT NAVIGATION BUTTONS ──────────────────────────
  function rotateToPropertyIndex(index, openModalAfter = false) {
    index = (index % 3 + 3) % 3;
    activePropIndex = index;
    isAutoRotating = false;

    // Find closest angle multiple
    const targetAngle = -index * angleStep;
    const currentRot = targetRotation;
    const baseOffset = Math.round((currentRot - targetAngle) / 360) * 360;
    targetRotation = targetAngle + baseOffset;

    updateActiveTab(index);

    if (openModalAfter) {
      setTimeout(() => {
        openPropertyModal(propertyIds[index]);
      }, 350);
    } else {
      setTimeout(() => {
        if (!isModalOpen) isAutoRotating = true;
      }, 3000);
    }
  }

  if (globePrevBtn) {
    globePrevBtn.addEventListener('click', () => {
      rotateToPropertyIndex(activePropIndex - 1);
    });
  }

  if (globeNextBtn) {
    globeNextBtn.addEventListener('click', () => {
      rotateToPropertyIndex(activePropIndex + 1);
    });
  }

  globeTabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => {
      rotateToPropertyIndex(idx);
    });
  });

  // ─── CLICK-TO-EXPAND MODAL CONTROLLER (AI STUDIO STYLE) ──────
  function openPropertyModal(targetPanelId) {
    if (!propertyModal) return;
    isModalOpen = true;
    isAutoRotating = false;

    // Activate the corresponding panel
    propertyPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === targetPanelId);
    });

    // Activate the corresponding modal top pill
    modalNavPills.forEach(pill => {
      pill.classList.toggle('active', pill.dataset.target === targetPanelId);
    });

    // Update index counter
    const curIdx = propertyIds.indexOf(targetPanelId);
    if (modalCycleIndicator) {
      modalCycleIndicator.textContent = `0${curIdx + 1} / 03`;
    }

    propertyModal.classList.add('open');
    propertyModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }

  function closePropertyModal() {
    if (!propertyModal) return;
    propertyModal.classList.remove('open');
    propertyModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    isModalOpen = false;

    setTimeout(() => {
      isAutoRotating = true;
    }, 1200);
  }

  // Click on globe cards to expand (handles direct clicks anywhere on the card)
  globeCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      if (dragDistance > 6) return;
      e.stopPropagation();
      const targetId = card.dataset.target || 'prop-azure';
      const propIdx = parseInt(card.dataset.index) || 0;
      rotateToPropertyIndex(propIdx);
      openPropertyModal(targetId);
    });

    // Keyboard enter / space
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const targetId = card.dataset.target || 'prop-azure';
        openPropertyModal(targetId);
      }
    });
  });

  // Modal Close triggers
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closePropertyModal);
  if (propertyModalBackdrop) propertyModalBackdrop.addEventListener('click', closePropertyModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen) {
      closePropertyModal();
    }
  });

  // Modal Top Navigation Pills Switcher
  modalNavPills.forEach((pill, idx) => {
    pill.addEventListener('click', () => {
      const targetId = pill.dataset.target;
      rotateToPropertyIndex(idx);
      openPropertyModal(targetId);
    });
  });

  // In-Modal Cycle Buttons (Prev / Next)
  if (modalPrevPropBtn) {
    modalPrevPropBtn.addEventListener('click', () => {
      const nextIdx = (activePropIndex - 1 + 3) % 3;
      rotateToPropertyIndex(nextIdx);
      openPropertyModal(propertyIds[nextIdx]);
    });
  }

  if (modalNextPropBtn) {
    modalNextPropBtn.addEventListener('click', () => {
      const nextIdx = (activePropIndex + 1) % 3;
      rotateToPropertyIndex(nextIdx);
      openPropertyModal(propertyIds[nextIdx]);
    });
  }

  // ─── HANDLE NAVBAR / FOOTER / HERO PROPERTY LINKS ────────────
  document.querySelectorAll('[data-prop]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      cancelAutoSlide();
      const propKey = link.dataset.prop;
      const targetPanelId = propNavMap[propKey];
      const targetIndex = propertyIds.indexOf(targetPanelId);

      // 1. Scroll vertically to #properties
      const propSection = document.getElementById('properties');
      if (propSection) {
        const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 84;
        const top = propSection.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }

      // 2. Rotate globe and open modal
      if (targetIndex !== -1) {
        setTimeout(() => {
          rotateToPropertyIndex(targetIndex, true);
        }, 400);
      }
    });
  });

  // ─── ACTIVE NAV LINK TRACKING (ZERO REFLOW) ─────────────────
  function updateActiveLink() {
    const currentSectionId = getCurrentSectionId();
    allNavLinks.forEach(link => link.classList.remove('active'));

    if (currentSectionId === 'brand-stage') {
      // Top brand stage: clean navbar state
    } else if (currentSectionId === 'properties') {
      const activePropKey = panelToNavMap[propertyIds[activePropIndex]] || 'azure-cliff';
      const activeLink = document.querySelector(`.navbar__link[data-prop="${activePropKey}"]`);
      if (activeLink) activeLink.classList.add('active');
    } else if (currentSectionId) {
      const activeLink = document.querySelector(`.navbar__link[href="#${currentSectionId}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  }

  // ─── SMOOTH SCROLL WITH PRECISE NAVBAR OFFSET ────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || this.hasAttribute('data-prop')) return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        cancelAutoSlide();
        const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 84;
        const offset = (targetId === '#brand-stage') ? 0 : navHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ─── MODAL MEDIA GALLERY: THUMBNAILS & LIGHTBOX ──────────────
  propertyPanels.forEach(panel => {
    const mainImg  = panel.querySelector('.dailyui-main-img');
    const thumbs   = panel.querySelectorAll('.dailyui-thumb');
    const heroWrap = panel.querySelector('.dailyui-hero-img-wrap');

    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        if (thumb.classList.contains('dailyui-thumb--video')) {
          openVideoLightbox(panel.dataset.propertyName || 'Virtual Tour');
          return;
        }

        const thumbImg = thumb.querySelector('img');
        if (mainImg && thumbImg) {
          mainImg.style.opacity = '0';
          setTimeout(() => {
            mainImg.src = thumbImg.src.replace(/w=\d+&h=\d+/g, 'w=1000&h=650');
            mainImg.alt = thumbImg.alt;
            mainImg.style.opacity = '1';
          }, 180);

          thumbs.forEach(t => t.classList.remove('active'));
          thumb.classList.add('active');
        }
      });
    });

    // Main image click: Open Gallery in Lightbox
    if (heroWrap) {
      heroWrap.addEventListener('click', (e) => {
        if (e.target.closest('.dailyui-play-trigger')) return;
        
        currentGallery = [];
        thumbs.forEach(thumb => {
          if (!thumb.classList.contains('dailyui-thumb--video')) {
            const img = thumb.querySelector('img');
            if (img) currentGallery.push(img.src.replace(/w=\d+&h=\d+/g, 'w=1600&h=1000'));
          }
        });
        currentIndex = 0;
        openLightbox();
      });
    }

    // Video play trigger button
    const playBtn = panel.querySelector('.dailyui-play-trigger');
    if (playBtn) {
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openVideoLightbox(panel.dataset.propertyName || 'Virtual Tour');
      });
    }
  });

  // ─── MOBILE MENU TOGGLE ──────────────────────────────────────
  const navLinks  = document.getElementById('navLinks');
  const navBurger = document.getElementById('navBurger');

  if (navBurger && navLinks) {
    navBurger.addEventListener('click', () => {
      navBurger.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.classList.toggle('no-scroll');
    });

    allNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        navBurger.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.classList.remove('no-scroll');
      });
    });
  }

  // ─── SCROLL REVEAL (INTERSECTION OBSERVER) ───────────────────
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay) || 0;
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, delay);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px',
    }
  );

  function revealOnScroll() {
    revealElements.forEach(el => revealObserver.observe(el));
  }

  revealOnScroll();

  // ─── ANIMATED STAT COUNTERS ──────────────────────────────────
  const counters = document.querySelectorAll('[data-count]');

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(c => counterObserver.observe(c));

  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const isDecimal = el.dataset.decimal === 'true';
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - (1 - progress) * (1 - progress);
      const current = ease * target;

      if (isDecimal) {
        el.textContent = current.toFixed(1);
      } else {
        el.textContent = Math.round(current).toLocaleString();
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ─── LIGHTBOX MODAL ──────────────────────────────────────────
  const lightbox        = document.getElementById('lightbox');
  const lightboxImg     = lightbox ? lightbox.querySelector('.lightbox__content img') : null;
  const lightboxClose   = lightbox ? lightbox.querySelector('.lightbox__close') : null;
  const lightboxPrev    = lightbox ? lightbox.querySelector('.lightbox__prev') : null;
  const lightboxNext    = lightbox ? lightbox.querySelector('.lightbox__next') : null;
  const lightboxCounter = lightbox ? lightbox.querySelector('.lightbox__counter') : null;

  let currentGallery = [];
  let currentIndex   = 0;

  function openLightbox() {
    if (!lightbox || currentGallery.length === 0) return;
    lightboxImg.src = currentGallery[currentIndex];
    if (lightboxCounter) lightboxCounter.textContent = `${currentIndex + 1} / ${currentGallery.length}`;
    if (lightboxPrev) lightboxPrev.style.display = 'flex';
    if (lightboxNext) lightboxNext.style.display = 'flex';
    lightbox.classList.add('open');
    document.body.classList.add('no-scroll');
  }

  function openVideoLightbox(propertyName) {
    if (!lightbox) return;
    lightboxImg.src = 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1600&h=1000&fit=crop';
    if (lightboxCounter) lightboxCounter.textContent = `✦ ${propertyName} — 4K Virtual Walkthrough`;
    if (lightboxPrev) lightboxPrev.style.display = 'none';
    if (lightboxNext) lightboxNext.style.display = 'none';
    lightbox.classList.add('open');
    document.body.classList.add('no-scroll');
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.classList.remove('no-scroll');
  }

  function showPrev() {
    if (currentGallery.length === 0) return;
    currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    lightboxImg.src = currentGallery[currentIndex];
    if (lightboxCounter) lightboxCounter.textContent = `${currentIndex + 1} / ${currentGallery.length}`;
  }

  function showNext() {
    if (currentGallery.length === 0) return;
    currentIndex = (currentIndex + 1) % currentGallery.length;
    lightboxImg.src = currentGallery[currentIndex];
    if (lightboxCounter) lightboxCounter.textContent = `${currentIndex + 1} / ${currentGallery.length}`;
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev)  lightboxPrev.addEventListener('click', showPrev);
  if (lightboxNext)  lightboxNext.addEventListener('click', showNext);

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  // ─── HERO BRAND TITLE INTERACTIVE LIGHT SWEEP ───────────────
  const brandTitle = document.getElementById('heroBrandTitle');
  if (brandTitle && window.matchMedia('(hover: hover)').matches) {
    brandTitle.addEventListener('mousemove', (e) => {
      const rect = brandTitle.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      const secondLine = brandTitle.querySelector('.brand-line--2');
      if (secondLine) {
        secondLine.style.backgroundPosition = `${x}% ${y}%`;
      }
    });

    brandTitle.addEventListener('mouseleave', () => {
      const secondLine = brandTitle.querySelector('.brand-line--2');
      if (secondLine) {
        secondLine.style.backgroundPosition = '';
      }
    });
  }

  // ─── AMENITY CARDS 3D TILT EFFECT ────────────────────────────
  if (window.matchMedia('(hover: hover)').matches) {
    amenityCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotateX = ((y - cy) / cy) * -4;
        const rotateY = ((x - cx) / cx) * 4;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

})();
