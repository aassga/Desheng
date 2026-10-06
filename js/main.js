/* 德勝集團 Desheng Group — main script (no dependencies) */
(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: solid on scroll, back-to-top ---------- */
  var header = document.querySelector('.site-header');
  var toTop = document.querySelector('.to-top');

  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-solid', y > 40);
    toTop.classList.toggle('is-visible', y > window.innerHeight * 0.8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  function setNav(open) {
    body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
  }
  toggle.addEventListener('click', function () {
    setNav(!body.classList.contains('nav-open'));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setNav(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && body.classList.contains('nav-open')) {
      setNav(false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', function (mq) {
    if (mq.matches) setNav(false);
  });

  /* ---------- Scrollspy: highlight current section in nav ---------- */
  var navLinks = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-current', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) {
      var section = document.querySelector(a.getAttribute('href'));
      if (section) spy.observe(section);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var siblings = Array.prototype.indexOf.call(entry.target.parentNode.children, entry.target);
        entry.target.style.transitionDelay = Math.min(siblings, 4) * 80 + 'ms';
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Hero slider ---------- */
  var hero = document.querySelector('.hero');
  var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
  var tabsWrap = hero.querySelector('.hero-tabs');
  var INTERVAL = 6000;
  var current = 0;
  var timer = null;

  hero.style.setProperty('--hero-interval', INTERVAL / 1000 + 's');

  var tabs = slides.map(function (slide, i) {
    var tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'hero-tab' + (i === 0 ? ' is-active' : '');
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    tab.setAttribute('aria-label', slide.dataset.label);
    tab.textContent = slide.dataset.label;
    tab.addEventListener('click', function () { go(i, true); });
    tabsWrap.appendChild(tab);
    return tab;
  });

  function go(index, user) {
    var next = (index + slides.length) % slides.length;
    if (next === current && !user) return;
    slides[current].classList.remove('is-active');
    tabs[current].classList.remove('is-active');
    tabs[current].setAttribute('aria-selected', 'false');

    current = next;
    var img = slides[current].querySelector('img');
    img.loading = 'eager';

    slides[current].classList.add('is-active');
    // restart the progress-bar animation
    void tabs[current].offsetWidth;
    tabs[current].classList.add('is-active');
    tabs[current].setAttribute('aria-selected', 'true');

    // warm up the following slide
    slides[(current + 1) % slides.length].querySelector('img').loading = 'eager';
    if (user) start();
  }

  function start() {
    stop();
    if (reduceMotion) return;
    timer = setInterval(function () { go(current + 1); }, INTERVAL);
    hero.classList.remove('is-paused');
  }
  function stop() {
    clearInterval(timer);
    timer = null;
  }
  function pause() {
    stop();
    hero.classList.add('is-paused');
  }

  hero.addEventListener('mouseenter', pause);
  hero.addEventListener('mouseleave', start);
  document.addEventListener('visibilitychange', function () {
    document.hidden ? pause() : start();
  });

  // touch swipe
  var touchX = null;
  hero.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1), true);
    touchX = null;
  });

  // keyboard on tabs
  tabsWrap.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      go(current + (e.key === 'ArrowRight' ? 1 : -1), true);
      tabs[current].focus();
    }
  });

  start();

  /* ---------- Partner marquee: duplicate items for a seamless loop ---------- */
  var track = document.querySelector('.marquee-track');
  if (track && !reduceMotion) {
    Array.prototype.slice.call(track.children).forEach(function (li) {
      var clone = li.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  }

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
