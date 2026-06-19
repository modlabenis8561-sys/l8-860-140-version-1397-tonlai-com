(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-site-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero-carousel]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var active = 0;
    var show = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show(active + 1);
      }, 5200);
    }
  }

  var input = document.querySelector('[data-search-input]');
  var category = document.querySelector('[data-category-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var applyFilter = function () {
    var q = input ? input.value.trim().toLowerCase() : '';
    var c = category ? category.value : '';
    cards.forEach(function (card) {
      var text = (card.getAttribute('data-title') || '').toLowerCase();
      var cat = card.getAttribute('data-category') || '';
      var okText = !q || text.indexOf(q) !== -1;
      var okCat = !c || cat === c;
      card.classList.toggle('hidden-by-filter', !(okText && okCat));
    });
  };
  if (input) input.addEventListener('input', applyFilter);
  if (category) category.addEventListener('change', applyFilter);

  var shell = document.querySelector('[data-player-shell]');
  if (shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.player-overlay');
    var started = false;
    var start = function () {
      if (!video || started) return;
      started = true;
      var src = video.getAttribute('data-stream');
      if (overlay) overlay.classList.add('is-hidden');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.play().catch(function () {});
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = src;
        video.play().catch(function () {});
      }
    };
    if (overlay) overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!started) start();
    });
  }
})();
