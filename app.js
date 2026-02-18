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

    setupPreloading();
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

    content.append(name, title);
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

    // Defer media loading - setupPreloading will set src in order
    if (isVideo(reason.image)) {
      var video = document.createElement('video');
      video.className = 'slide-video';
      video.dataset.src = reason.image;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      el.appendChild(video);
    } else {
      var bg = make('div', 'slide-bg');
      bg.dataset.src = reason.image;
      el.appendChild(bg);
    }

    var loader = make('div', 'slide-loader');
    loader.innerHTML = '<div class="slide-loader-spinner"></div>';
    el.appendChild(loader);

    const overlay = make('div', 'slide-overlay');

    const content = make('div', 'slide-content');

    const counter = make('p', 'slide-counter');
    counter.textContent = (index + 1) + ' / ' + CONFIG.reasons.length;

    const text = make('h2', 'slide-text');
    text.textContent = reason.text;

    content.append(counter, text);

    if (reason.story) {
      const storyBtn = make('button', 'story-btn');
      storyBtn.textContent = '\u2661 הרחבה';
      storyBtn.addEventListener('click', function () {
        openStory(reason.story);
      });
      content.appendChild(storyBtn);
    }

    el.append(overlay, content);
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

  // ── Sequential media preloading ──
  //
  // Loads slide media one-by-one in presentation order so that
  // upcoming slides are ready before the user reaches them.
  // A spinner shows only if the user scrolls faster than the queue.

  function setupPreloading() {
    var slides = Array.from(app.querySelectorAll('.slide--reason'));
    var idx = 0;

    function loadNext() {
      if (idx >= slides.length) return;
      loadSlideMedia(slides[idx], function () {
        idx++;
        loadNext();
      });
    }

    loadNext();
  }

  function loadSlideMedia(slide, onComplete) {
    if (slide.dataset.loaded) {
      if (onComplete) onComplete();
      return;
    }
    slide.dataset.loaded = 'true';

    var video = slide.querySelector('.slide-video');
    var bg = slide.querySelector('.slide-bg');

    function done() {
      slide.classList.add('media-loaded');
      // If this slide is already visible, start video playback
      if (video && slide.classList.contains('active')) {
        video.play().catch(function () {});
      }
      if (onComplete) onComplete();
    }

    if (video && video.dataset.src) {
      video.addEventListener('canplay', done, { once: true });
      video.addEventListener('error', done, { once: true });
      video.src = video.dataset.src;
    } else if (bg && bg.dataset.src) {
      var img = new Image();
      img.onload = function () {
        bg.style.backgroundImage = "url('" + bg.dataset.src + "')";
        done();
      };
      img.onerror = done;
      img.src = bg.dataset.src;
    } else {
      done();
    }
  }

  // ── Active slide detection ──

  function setupObserver() {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle('active', entry.isIntersecting);

          // Play/pause video backgrounds based on visibility
          var video = entry.target.querySelector('.slide-video');
          if (video && video.src) {
            if (entry.isIntersecting) {
              video.play().catch(function () {});
            } else {
              video.pause();
            }
          }
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
  //
  // iOS WebKit requires audio.play() to be called *synchronously*
  // inside a user-gesture handler (click / touchend). No wrappers,
  // no stopPropagation, no async gaps.

  var soundHint = null;
  var audioUnlocked = false;

  function setupMusic() {
    audio.src = CONFIG.music;
    audio.loop = true;
    audio.load(); // pre-buffer on iOS

    musicBtn.classList.add('visible');

    // Show the sound-on pill
    showSoundHint();

    // ── Pill click: play directly (iOS needs this) ──
    // Uses touchend for iOS + click for everything else
    function onPillTap(e) {
      e.preventDefault();
      audio.play();
      onPlaying();
    }

    // ── Global catch-all: any tap on the page starts music ──
    function onFirstTap() {
      if (isPlaying) return;
      audio.play();
      onPlaying();
    }

    // Pill listeners
    setTimeout(function () {
      if (soundHint) {
        soundHint.addEventListener('touchend', onPillTap);
        soundHint.addEventListener('click', onPillTap);
      }
    }, 0);

    // Global listeners - any tap starts music
    document.addEventListener('touchend', onFirstTap);
    document.addEventListener('click', onFirstTap);

    // Music toggle button
    musicBtn.addEventListener('click', function (e) {
      e.stopPropagation(); // don't trigger onFirstTap
      if (isPlaying) {
        audio.pause();
        isPlaying = false;
        musicBtn.classList.remove('playing');
        musicBtn.classList.add('muted');
      } else {
        audio.play();
        isPlaying = true;
        musicBtn.classList.add('playing');
        musicBtn.classList.remove('muted');
        hideSoundHint();
      }
    });

    // Try autoplay (will work on desktop, fail on mobile)
    try {
      var p = audio.play();
      if (p && p.then) {
        p.then(function () { onPlaying(); })
         .catch(function () { /* blocked - waiting for tap */ });
      }
    } catch (e) {
      // old browsers
    }
  }

  function onPlaying() {
    isPlaying = true;
    audioUnlocked = true;
    musicBtn.classList.add('playing');
    musicBtn.classList.remove('muted');
    hideSoundHint();
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

  function isVideo(path) {
    return /\.(mp4|webm|mov|ogg)$/i.test(path);
  }

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
