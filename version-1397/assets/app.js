(function () {
    var header = document.querySelector('[data-header]');
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    if (header) {
        window.addEventListener('scroll', function () {
            header.classList.toggle('is-scrolled', window.scrollY > 12);
        }, { passive: true });
    }

    function bindHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function bindCardFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-filter-keyword]');
            var type = scope.querySelector('[data-filter-type]');
            var year = scope.querySelector('[data-filter-year]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
            var empty = scope.querySelector('[data-filter-empty]');

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var typeValue = type ? type.value : '';
                var yearValue = year ? year.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year')
                    ].join(' ').toLowerCase();
                    var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchedType = !typeValue || card.getAttribute('data-type') === typeValue;
                    var matchedYear = !yearValue || card.getAttribute('data-year') === yearValue;
                    var matched = matchedKeyword && matchedType && matchedYear;
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            [input, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            apply();
        });
    }

    function cardTemplate(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card">',
            '<a class="poster-link" href="' + item.url + '" aria-label="观看' + escapeHtml(item.title) + '">',
            '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '<span class="poster-play">▶</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<div class="movie-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
            '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
            '<p>' + escapeHtml(item.oneLine) + '</p>',
            '<div class="tag-row">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    function bindSearchPage() {
        var container = document.querySelector('[data-search-results]');
        if (!container || !window.MOVIE_INDEX) {
            return;
        }
        var form = document.querySelector('[data-search-form]');
        var input = document.querySelector('[data-search-input]');
        var empty = document.querySelector('[data-search-empty]');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (input) {
            input.value = initial;
        }

        function render() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var results = window.MOVIE_INDEX.filter(function (item) {
                var text = [item.title, item.region, item.year, item.type, item.genre, (item.tags || []).join(' ')].join(' ').toLowerCase();
                return !keyword || text.indexOf(keyword) !== -1;
            }).slice(0, keyword ? 160 : 80);
            container.innerHTML = results.map(cardTemplate).join('');
            if (empty) {
                empty.classList.toggle('is-visible', results.length === 0);
            }
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                render();
                if (history.pushState && input) {
                    var url = './search.html' + (input.value.trim() ? '?q=' + encodeURIComponent(input.value.trim()) : '');
                    history.pushState(null, '', url);
                }
            });
        }
        if (input) {
            input.addEventListener('input', render);
        }
        render();
    }

    function bindPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var overlay = player.querySelector('[data-play]');
            var stream = player.getAttribute('data-stream');
            var ready = false;
            var hls = null;

            function attach() {
                if (!video || !stream || ready) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
                ready = true;
            }

            function play() {
                attach();
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                if (video) {
                    var promise = video.play();
                    if (promise && promise.catch) {
                        promise.catch(function () {});
                    }
                }
            }

            if (overlay) {
                overlay.addEventListener('click', play);
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (!ready) {
                        play();
                    }
                });
                video.addEventListener('play', function () {
                    if (overlay) {
                        overlay.classList.add('is-hidden');
                    }
                });
                video.addEventListener('error', function () {
                    if (hls) {
                        hls.destroy();
                        hls = null;
                        ready = false;
                    }
                });
            }
        });
    }

    bindHero();
    bindCardFilters();
    bindSearchPage();
    bindPlayers();
})();
