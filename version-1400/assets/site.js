(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initMenu() {
    var nav = document.querySelector('.site-nav');
    var toggle = document.querySelector('.menu-toggle');
    if (!nav || !toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      var expanded = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  }

  function initForms() {
    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        var action = form.getAttribute('action') || 'search.html';
        if (value) {
          window.location.href = action + '?q=' + encodeURIComponent(value);
        }
      });
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(i);
        play();
      });
    });
    show(0);
    play();
  }

  function initSearchPage() {
    var results = document.getElementById('searchResults');
    var input = document.getElementById('pageSearchInput');
    var title = document.getElementById('searchTitleText');
    if (!results || !input || typeof SEARCH_DATA === 'undefined') {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;
    function render(query) {
      var q = query.trim().toLowerCase();
      if (title) {
        title.textContent = q ? '搜索：' + query.trim() : '影片搜索';
      }
      if (!q) {
        results.innerHTML = '<div class="empty-state">输入片名、地区、类型或标签，即可快速查找影片。</div>';
        return;
      }
      var words = q.split(/\s+/).filter(Boolean);
      var list = SEARCH_DATA.filter(function (item) {
        var text = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.one_line].join(' ').toLowerCase();
        return words.every(function (word) {
          return text.indexOf(word) !== -1;
        });
      }).slice(0, 180);
      if (!list.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配影片。</div>';
        return;
      }
      results.innerHTML = list.map(function (item) {
        return '<article class="movie-card">' +
          '<a class="poster-wrap" href="' + escapeHtml(item.href) + '">' +
          '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="play-badge">▶</span>' +
          '</a>' +
          '<div class="movie-card-body">' +
          '<a class="movie-title" href="' + escapeHtml(item.href) + '">' + escapeHtml(item.title) + '</a>' +
          '<p class="movie-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</p>' +
          '<p class="movie-desc">' + escapeHtml(item.one_line) + '</p>' +
          '<div class="tag-row"><span>' + escapeHtml(item.genre) + '</span></div>' +
          '</div>' +
          '</article>';
      }).join('');
    }
    var form = document.getElementById('pageSearchForm');
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var value = input.value.trim();
        if (value) {
          history.replaceState(null, '', 'search.html?q=' + encodeURIComponent(value));
        }
        render(value);
      });
    }
    input.addEventListener('input', function () {
      render(input.value);
    });
    render(initial);
  }

  function initPlayer() {
    var video = document.querySelector('[data-video-player]');
    var cover = document.querySelector('.video-cover');
    var button = document.querySelector('.player-start');
    if (!video || typeof playbackUrl !== 'string') {
      return;
    }
    var started = false;
    var hlsInstance = null;
    function attach() {
      if (started) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playbackUrl;
      } else if (window.Hls && Hls.isSupported()) {
        hlsInstance = new Hls({ enableWorker: true });
        hlsInstance.loadSource(playbackUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = playbackUrl;
      }
      started = true;
    }
    function play() {
      attach();
      video.controls = true;
      if (cover) {
        cover.classList.add('hide');
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }
    if (cover) {
      cover.addEventListener('click', play);
    }
    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        play();
      });
    }
    video.addEventListener('click', function () {
      if (!started || video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    initMenu();
    initForms();
    initHero();
    initSearchPage();
    initPlayer();
  });
})();
