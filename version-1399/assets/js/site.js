(function () {
    var ready = function (callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    };

    ready(function () {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');
        if (toggle && mobileNav) {
            toggle.addEventListener('click', function () {
                mobileNav.classList.toggle('is-open');
            });
        }

        var forms = document.querySelectorAll('[data-search-form]');
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input');
                var value = input ? input.value.trim() : '';
                var target = 'search.html';
                if (value) {
                    target += '?q=' + encodeURIComponent(value);
                }
                window.location.href = target;
            });
        });

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var previous = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var current = 0;
            var timer = null;
            var showSlide = function (index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === current);
                });
            };
            var schedule = function () {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    showSlide(current + 1);
                }, 6200);
            };
            if (slides.length > 1) {
                dots.forEach(function (dot, index) {
                    dot.addEventListener('click', function () {
                        showSlide(index);
                        schedule();
                    });
                });
                if (previous) {
                    previous.addEventListener('click', function () {
                        showSlide(current - 1);
                        schedule();
                    });
                }
                if (next) {
                    next.addEventListener('click', function () {
                        showSlide(current + 1);
                        schedule();
                    });
                }
                schedule();
            }
        }

        var filterRoot = document.querySelector('[data-filter-root]');
        if (filterRoot) {
            var keywordInput = filterRoot.querySelector('[data-filter-keyword]');
            var regionSelect = filterRoot.querySelector('[data-filter-region]');
            var typeSelect = filterRoot.querySelector('[data-filter-type]');
            var yearSelect = filterRoot.querySelector('[data-filter-year]');
            var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-movie-card]'));
            var empty = filterRoot.querySelector('[data-empty-state]');
            var params = new URLSearchParams(window.location.search);
            var incoming = params.get('q');
            if (incoming && keywordInput) {
                keywordInput.value = incoming;
            }
            var filter = function () {
                var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
                var region = regionSelect ? regionSelect.value : '';
                var type = typeSelect ? typeSelect.value : '';
                var year = yearSelect ? yearSelect.value : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute('data-title') || '',
                        card.getAttribute('data-region') || '',
                        card.getAttribute('data-type') || '',
                        card.getAttribute('data-year') || '',
                        card.getAttribute('data-genre') || '',
                        card.getAttribute('data-tags') || ''
                    ].join(' ').toLowerCase();
                    var matched = true;
                    if (keyword && text.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (region && card.getAttribute('data-region') !== region) {
                        matched = false;
                    }
                    if (type && card.getAttribute('data-type') !== type) {
                        matched = false;
                    }
                    if (year && card.getAttribute('data-year') !== year) {
                        matched = false;
                    }
                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            };
            [keywordInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', filter);
                    control.addEventListener('change', filter);
                }
            });
            filter();
        }

        var player = document.querySelector('[data-movie-player]');
        if (player) {
            var playButton = document.querySelector('[data-play-button]');
            var source = player.getAttribute('data-src');
            var started = false;
            var hlsInstance = null;
            var startPlayer = function () {
                if (!source) {
                    return;
                }
                if (!started) {
                    started = true;
                    if (player.canPlayType('application/vnd.apple.mpegurl')) {
                        player.src = source;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls();
                        hlsInstance.loadSource(source);
                        hlsInstance.attachMedia(player);
                    } else {
                        player.src = source;
                    }
                    player.controls = true;
                    if (playButton) {
                        playButton.classList.add('is-hidden');
                    }
                }
                var promise = player.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            };
            if (playButton) {
                playButton.addEventListener('click', startPlayer);
            }
            player.addEventListener('click', function () {
                if (!started) {
                    startPlayer();
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                    hlsInstance.destroy();
                }
            });
        }
    });
})();
