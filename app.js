(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const app = $('app');
  const progressBar = $('progress');
  const musicBtn = $('music-btn');
  const audio = $('audio');
  const storyModal = $('story-modal');
  const storyTextEl = $('story-text');
  const storySheet = $('story-sheet');

  let isPlaying = false;
  let musicReady = false;

  // ── Build all slides ──

  function build() {
    buildIntro();
    CONFIG.reasons.forEach(buildReason);
    if (CONFIG.closing) buildClosing();

    setupObserver();
    setupScroll();
    setupStory();
    setupMusic();
  }

  function buildIntro() {
    const el = make('div', 'slide slide--intro');

    const content = make('div', 'slide-content');

    const name = make('p', 'intro-name');
    name.textContent = CONFIG.partnerName;

    const title = make('h1', 'intro-title');
    title.textContent = CONFIG.title;

    const btn = make('button', 'intro-start');
    btn.textContent = '\u2661 התחילי';
    btn.addEventListener('click', handleStart);

    content.append(name, title, btn);
    el.appendChild(content);

    addFloatingHearts(el, 12);

    const hint = make('div', 'swipe-hint');
    hint.innerHTML =
      '<span>\u05D4\u05D7\u05DC\u05D9\u05E7\u05D9 \u05DC\u05DE\u05E2\u05DC\u05D4</span>' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">' +
      '<path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    el.appendChild(hint);

    app.appendChild(el);
  }

  function buildReason(reason, index) {
    const el = make('div', 'slide slide--reason');

    const bg = make('div', 'slide-bg');
    bg.style.backgroundImage = "url('" + reason.image + "')";

    const overlay = make('div', 'slide-overlay');

    const content = make('div', 'slide-content');

    const counter = make('p', 'slide-counter');
    counter.textContent = (index + 1) + ' / ' + CONFIG.reasons.length;

    const text = make('h2', 'slide-text');
    text.textContent = reason.text;

    content.append(counter, text);

    if (reason.story) {
      const storyBtn = make('button', 'story-btn');
      storyBtn.textContent = '\u2661 \u05D9\u05E9 \u05DC\u05E0\u05D5 \u05E1\u05D9\u05E4\u05D5\u05E8';
      storyBtn.addEventListener('click', function () {
        openStory(reason.story);
      });
      content.appendChild(storyBtn);
    }

    el.append(bg, overlay, content);
    app.appendChild(el);
  }

  function buildClosing() {
    const el = make('div', 'slide slide--closing');
    const content = make('div', 'slide-content');

    const text = make('h2', 'closing-text');
    text.textContent = CONFIG.closing.text;

    const sub = make('p', 'closing-subtext');
    sub.textContent = CONFIG.closing.subtext;

    content.append(text, sub);
    el.appendChild(content);

    addFloatingHearts(el, 10);

    app.appendChild(el);
  }

  // ── Active slide detection ──

  function setupObserver() {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle('active', entry.isIntersecting);
        });
      },
      { root: app, threshold: 0.55 }
    );

    app.querySelectorAll('.slide').forEach(function (s) {
      observer.observe(s);
    });
  }

  // ── Scroll progress ──

  function setupScroll() {
    app.addEventListener(
      'scroll',
      function () {
        var max = app.scrollHeight - app.clientHeight;
        var pct = max > 0 ? (app.scrollTop / max) * 100 : 0;
        progressBar.style.width = pct + '%';
      },
      { passive: true }
    );
  }

  // ── Music ──

  var soundHint = null;

  function setupMusic() {
    audio.src = CONFIG.music;
    musicBtn.classList.add('visible');
    musicBtn.addEventListener('click', toggleMusic);

    // Try autoplay immediately
    playAudio();

    // Show the sound-on pill
    showSoundHint();
  }

  function playAudio() {
    audio.play().then(function () {
      isPlaying = true;
      musicBtn.classList.add('playing');
      musicBtn.classList.remove('muted');
      hideSoundHint();
    }).catch(function () {
      // autoplay blocked - pill is visible for user to tap
    });
  }

  function handleStart() {
    playAudio();
    var slides = app.querySelectorAll('.slide');
    if (slides[1]) {
      slides[1].scrollIntoView({ behavior: 'smooth' });
    }
  }

  function showSoundHint() {
    soundHint = make('div', 'sound-hint');
    soundHint.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">' +
      '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>' +
      '<path d="M15.54 8.46a5 5 0 010 7.07"/>' +
      '<path d="M19.07 4.93a10 10 0 010 14.14"/>' +
      '</svg>' +
      '<span>\u05D4\u05E4\u05E2\u05D9\u05DC\u05D9 \u05E6\u05DC\u05D9\u05DC</span>';
    // Clicking the pill always tries to play - never pauses
    soundHint.addEventListener('click', function (e) {
      e.stopPropagation();
      playAudio();
    });
    document.body.appendChild(soundHint);
    requestAnimationFrame(function () {
      soundHint.classList.add('visible');
    });
  }

  function hideSoundHint() {
    if (!soundHint) return;
    soundHint.classList.remove('visible');
    setTimeout(function () {
      if (soundHint && soundHint.parentNode) {
        soundHint.parentNode.removeChild(soundHint);
      }
      soundHint = null;
    }, 500);
  }

  function toggleMusic() {
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      musicBtn.classList.remove('playing');
      musicBtn.classList.add('muted');
    } else {
      playAudio();
    }
  }

  // ── Story modal ──

  function setupStory() {
    $('story-backdrop').addEventListener('click', closeStory);

    // Swipe down to close
    var startY = 0;
    storySheet.addEventListener(
      'touchstart',
      function (e) {
        startY = e.touches[0].clientY;
      },
      { passive: true }
    );
    storySheet.addEventListener(
      'touchend',
      function (e) {
        if (e.changedTouches[0].clientY - startY > 80) {
          closeStory();
        }
      },
      { passive: true }
    );
  }

  function openStory(text) {
    storyTextEl.textContent = text;
    storyModal.classList.add('open');
    app.style.overflow = 'hidden';
  }

  function closeStory() {
    storyModal.classList.remove('open');
    app.style.overflow = '';
  }

  // ── Helpers ──

  function addFloatingHearts(container, count) {
    var wrapper = make('div', 'floating-hearts');
    var symbols = ['\u2661', '\u2665', '\u2764'];
    for (var i = 0; i < count; i++) {
      var heart = make('span', 'heart');
      heart.textContent = symbols[i % symbols.length];
      heart.style.left = (Math.random() * 90 + 5) + '%';
      heart.style.animationDuration = (6 + Math.random() * 8) + 's';
      heart.style.animationDelay = (Math.random() * 8) + 's';
      heart.style.fontSize = (0.7 + Math.random() * 1) + 'rem';
      heart.style.color = 'rgba(91, 184, 204, ' + (0.1 + Math.random() * 0.15) + ')';
      wrapper.appendChild(heart);
    }
    container.appendChild(wrapper);
  }

  function make(tag, className) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    return el;
  }

  // ── Init ──

  build();
})();
