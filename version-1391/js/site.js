(function () {
  function toArray(list) {
    return Array.prototype.slice.call(list || []);
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !mobileNav) {
      return;
    }

    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
      document.body.classList.toggle("nav-open", mobileNav.classList.contains("is-open"));
    });
  }

  function initSearchForms() {
    toArray(document.querySelectorAll("[data-search-form]")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";

        if (!value) {
          event.preventDefault();
          return;
        }

        event.preventDefault();
        var target = form.getAttribute("action") || "search.html";
        window.location.href = target + "?q=" + encodeURIComponent(value);
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = toArray(hero.querySelectorAll("[data-hero-slide]"));
    var dots = toArray(hero.querySelectorAll("[data-hero-dot]"));
    var nextButton = hero.querySelector("[data-hero-next]");
    var prevButton = hero.querySelector("[data-hero-prev]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    if (prevButton) {
      prevButton.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initCatalogFilter() {
    var grid = document.querySelector("[data-filter-grid]");

    if (!grid) {
      return;
    }

    var input = document.querySelector("[data-filter-input]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var sortSelect = document.querySelector("[data-filter-sort]");
    var count = document.querySelector("[data-filter-count]");
    var cards = toArray(grid.querySelectorAll(".movie-card"));
    var originalCards = cards.slice();

    function normalize(value) {
      return String(value || "").toLowerCase();
    }

    function cardText(card) {
      return normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-tags"),
        card.getAttribute("data-category")
      ].join(" "));
    }

    function applySort() {
      var value = sortSelect ? sortSelect.value : "default";
      var sorted = cards.slice();

      if (value === "year-desc") {
        sorted.sort(function (a, b) {
          return normalize(b.getAttribute("data-year")).localeCompare(normalize(a.getAttribute("data-year")), "zh-CN");
        });
      } else if (value === "title-asc") {
        sorted.sort(function (a, b) {
          return normalize(a.getAttribute("data-title")).localeCompare(normalize(b.getAttribute("data-title")), "zh-CN");
        });
      } else {
        sorted = originalCards.slice();
      }

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    function applyFilter() {
      var query = input ? normalize(input.value.trim()) : "";
      var type = typeSelect ? typeSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      var visible = 0;

      applySort();

      cards.forEach(function (card) {
        var matchesQuery = !query || cardText(card).indexOf(query) !== -1;
        var matchesType = !type || card.getAttribute("data-type") === type;
        var matchesYear = !year || card.getAttribute("data-year") === year;
        var isVisible = matchesQuery && matchesType && matchesYear;

        card.style.display = isVisible ? "" : "none";

        if (isVisible) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + " 部影片";
      }
    }

    [input, typeSelect, yearSelect, sortSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  }

  function movieCardTemplate(movie) {
    return [
      "<article class=\"movie-card\">",
      "  <a class=\"movie-card__poster\" href=\"" + movie.url + "\">",
      "    <img src=\"" + movie.cover + "\" alt=\"" + movie.title.replace(/\"/g, "&quot;") + "\" loading=\"lazy\">",
      "    <span class=\"movie-card__badge\">" + movie.badge + "</span>",
      "    <span class=\"movie-card__play\">▶</span>",
      "  </a>",
      "  <div class=\"movie-card__body\">",
      "    <a class=\"movie-card__title\" href=\"" + movie.url + "\">" + movie.title + "</a>",
      "    <p class=\"movie-card__meta\">" + movie.region + " · " + movie.year + " · " + movie.type + "</p>",
      "    <p class=\"movie-card__desc\">" + movie.oneLine + "</p>",
      "  </div>",
      "</article>"
    ].join("\n");
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-page-input]");
    var form = document.querySelector("[data-search-page-form]");
    var status = document.querySelector("[data-search-status]");

    if (!results || !window.siteMovies) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (input) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return String(value || "").toLowerCase();
    }

    function runSearch(value) {
      var query = normalize(value.trim());
      var matched = window.siteMovies.filter(function (movie) {
        if (!query) {
          return true;
        }

        return normalize([
          movie.title,
          movie.region,
          movie.year,
          movie.type,
          movie.genre,
          movie.tags,
          movie.oneLine
        ].join(" ")).indexOf(query) !== -1;
      }).slice(0, 120);

      results.innerHTML = matched.map(movieCardTemplate).join("\n");

      if (status) {
        status.textContent = query ? "找到 " + matched.length + " 条相关影片" : "展示热门影片";
      }
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        runSearch(input ? input.value : "");
      });
    }

    if (input) {
      input.addEventListener("input", function () {
        runSearch(input.value);
      });
    }

    runSearch(initialQuery);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initSearchForms();
    initHero();
    initCatalogFilter();
    initSearchPage();
  });
})();
