
(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('.global-search-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      if (!value) {
        event.preventDefault();
        if (input) {
          input.focus();
        }
        return;
      }
      event.preventDefault();
      window.location.href = './search.html?q=' + encodeURIComponent(value);
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;

  function setHero(index) {
    if (!slides.length) {
      return;
    }
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, itemIndex) {
      slide.classList.toggle('is-active', itemIndex === activeIndex);
    });
    dots.forEach(function (dot, itemIndex) {
      dot.classList.toggle('is-active', itemIndex === activeIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      setHero(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      setHero(activeIndex + 1);
    }, 5200);
  }

  document.querySelectorAll('[data-filter-value]').forEach(function (button) {
    button.addEventListener('click', function () {
      var value = button.getAttribute('data-filter-value') || 'all';
      var shell = button.closest('[data-filter-shell]') || document;
      shell.querySelectorAll('[data-filter-value]').forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      shell.setAttribute('data-active-filter', value.toLowerCase());
      applyLocalFilter(shell);
    });
  });

  document.querySelectorAll('[data-local-search]').forEach(function (input) {
    input.addEventListener('input', function () {
      var shell = input.closest('[data-filter-shell]') || document;
      applyLocalFilter(shell);
    });
  });

  function applyLocalFilter(shell) {
    var input = shell.querySelector('[data-local-search]');
    var query = input ? input.value.trim().toLowerCase() : '';
    var active = (shell.getAttribute('data-active-filter') || 'all').toLowerCase();
    var visible = 0;

    shell.querySelectorAll('[data-movie-card]').forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var passQuery = !query || text.indexOf(query) !== -1;
      var passFilter = active === 'all' || text.indexOf(active) !== -1;
      var show = passQuery && passFilter;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });

    var empty = shell.querySelector('[data-empty-message]');
    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  }

  var searchResults = document.querySelector('[data-search-results]');
  if (searchResults && Array.isArray(window.searchIndex)) {
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get('q') || '').trim();
    var input = document.querySelector('[data-search-page-input]');
    if (input) {
      input.value = keyword;
    }
    renderSearchResults(keyword);
  }

  function renderSearchResults(keyword) {
    var query = keyword.toLowerCase();
    var results = window.searchIndex.filter(function (item) {
      return !query || item.search.indexOf(query) !== -1;
    }).slice(0, 240);

    if (!results.length) {
      searchResults.innerHTML = '<div class="empty-message show">没有找到匹配的影片，请更换关键词。</div>';
      return;
    }

    searchResults.innerHTML = results.map(function (item) {
      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="./' + item.url + '" aria-label="观看' + escapeHtml(item.title) + '">',
        '    <img src="./' + item.cover + '" alt="' + escapeHtml(item.title) + ' 在线观看" loading="lazy">',
        '    <span class="poster-year">' + escapeHtml(item.year) + '</span>',
        '    <span class="poster-play">▶</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <a class="movie-card-title" href="./' + item.url + '">' + escapeHtml(item.title) + '</a>',
        '    <div class="movie-card-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</div>',
        '    <p>' + escapeHtml(item.line) + '</p>',
        '    <div class="tag-list"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
