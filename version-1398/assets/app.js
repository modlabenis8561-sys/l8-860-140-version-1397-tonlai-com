(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      var action = form.getAttribute('action') || './movies.html';

      if (!value) {
        return;
      }

      event.preventDefault();
      window.location.href = action.split('?')[0] + '?q=' + encodeURIComponent(value);
    });
  });

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    startTimer();
  }

  var grid = document.querySelector('[data-card-grid]');

  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var empty = document.querySelector('[data-empty-result]');
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim().toLowerCase();
    var searchInputs = document.querySelectorAll('input[name="q"]');
    var selected = {};

    searchInputs.forEach(function (input) {
      if (query) {
        input.value = query;
      }

      input.addEventListener('input', function () {
        query = input.value.trim().toLowerCase();
        applyFilters();
      });
    });

    document.querySelectorAll('[data-filter-value]').forEach(function (button) {
      button.addEventListener('click', function () {
        var group = button.getAttribute('data-filter-group') || 'default';
        var value = button.getAttribute('data-filter-value') || 'all';
        selected[group] = value;

        document.querySelectorAll('[data-filter-group="' + group + '"]').forEach(function (item) {
          item.classList.toggle('active', item === button);
        });

        applyFilters();
      });
    });

    function textOf(card) {
      return [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-tags') || ''
      ].join(' ').toLowerCase();
    }

    function matchesSelected(card) {
      var groups = Object.keys(selected);

      for (var i = 0; i < groups.length; i += 1) {
        var group = groups[i];
        var value = selected[group];

        if (!value || value === 'all') {
          continue;
        }

        var source = '';

        if (group === 'type') {
          source = card.getAttribute('data-type') || '';
        } else if (group === 'region') {
          source = card.getAttribute('data-region') || '';
        } else {
          source = textOf(card);
        }

        if (source.indexOf(value) === -1) {
          return false;
        }
      }

      return true;
    }

    function applyFilters() {
      var visible = 0;

      cards.forEach(function (card) {
        var ok = (!query || textOf(card).indexOf(query) !== -1) && matchesSelected(card);
        card.style.display = ok ? '' : 'none';

        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    applyFilters();
  }
})();
