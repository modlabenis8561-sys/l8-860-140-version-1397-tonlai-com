(function () {
    function select(selector, root) {
        return (root || document).querySelector(selector);
    }

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = select('[data-menu-toggle]');
        var panel = select('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = select('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var prev = select('[data-hero-prev]', hero);
        var next = select('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(text) {
        return String(text || '').toLowerCase().trim();
    }

    function initFilters() {
        selectAll('[data-filter-scope]').forEach(function (scope) {
            var input = select('[data-filter-input]', scope);
            var year = select('[data-filter-year]', scope);
            var type = select('[data-filter-type]', scope);
            var parent = scope.parentElement || document;
            var cards = selectAll('.searchable-card', parent);
            var empty = select('[data-empty-state]', parent);

            function apply() {
                var query = normalize(input ? input.value : '');
                var yearValue = year ? year.value : '';
                var typeValue = type ? type.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-title'));
                    var cardYear = card.getAttribute('data-year') || '';
                    var cardType = card.getAttribute('data-type') || '';
                    var matchQuery = !query || text.indexOf(query) !== -1;
                    var matchYear = !yearValue || cardYear === yearValue;
                    var matchType = !typeValue || cardType.indexOf(typeValue) !== -1;
                    var ok = matchQuery && matchYear && matchType;
                    card.classList.toggle('is-hidden', !ok);
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            [input, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (query && input && parent.hasAttribute('data-search-page')) {
                input.value = query;
            }
            apply();
        });
    }

    function player(source) {
        function run() {
            var video = select('[data-video-player]');
            var cover = select('[data-player-cover]');
            if (!video || !source) {
                return;
            }
            var ready = false;
            var hls = null;

            function load() {
                if (ready) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
                ready = true;
            }

            function start() {
                load();
                if (cover) {
                    cover.classList.add('is-hidden');
                }
                video.controls = true;
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        if (cover) {
                            cover.classList.remove('is-hidden');
                        }
                    });
                }
            }

            if (cover) {
                cover.addEventListener('click', start);
            }
            video.addEventListener('click', function () {
                if (!ready || video.paused) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                if (cover) {
                    cover.classList.add('is-hidden');
                }
            });
            window.addEventListener('pagehide', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', run);
        } else {
            run();
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
    });

    window.MovieSite = {
        player: player
    };
})();
