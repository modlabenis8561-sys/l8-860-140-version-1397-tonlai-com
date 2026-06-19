(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        var index = 0;
        var timer;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('active', itemIndex === index);
            });

            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('active', itemIndex === index);
            });
        }

        function startTimer() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-index')) || 0);
                startTimer();
            });
        });

        startTimer();
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var searchInput = document.querySelector('[data-search-input]');
    var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
    var emptyState = document.querySelector('[data-empty-state]');
    var filters = {};

    function filterCards() {
        if (!cards.length) {
            return;
        }

        var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var shown = 0;

        cards.forEach(function (card) {
            var text = (card.getAttribute('data-search') || '').toLowerCase();
            var matchedText = !q || text.indexOf(q) !== -1;
            var matchedFilters = Object.keys(filters).every(function (key) {
                var value = filters[key];
                if (!value || value === 'all') {
                    return true;
                }
                return (card.getAttribute('data-' + key) || '').indexOf(value) !== -1;
            });
            var visible = matchedText && matchedFilters;

            card.style.display = visible ? '' : 'none';

            if (visible) {
                shown += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('show', shown === 0);
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterCards);
    }

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            var key = chip.getAttribute('data-filter');
            var value = chip.getAttribute('data-value');

            if (!key) {
                return;
            }

            chips.filter(function (item) {
                return item.getAttribute('data-filter') === key;
            }).forEach(function (item) {
                item.classList.remove('active');
            });

            chip.classList.add('active');
            filters[key] = value;
            filterCards();
        });
    });

    function startPlayer(wrapper) {
        var video = wrapper.querySelector('video');
        var overlay = wrapper.querySelector('.player-overlay');
        var message = wrapper.querySelector('[data-player-message]');
        var stream = wrapper.getAttribute('data-stream');

        if (!video || !stream) {
            return;
        }

        if (message) {
            message.classList.remove('show');
            message.textContent = '';
        }

        function play() {
            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (!wrapper.playerReady) {
            wrapper.playerReady = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                play();
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    play();
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal && message) {
                        message.textContent = '播放暂时中断，请刷新重试';
                        message.classList.add('show');
                    }
                });
                wrapper.hls = hls;
            } else if (message) {
                message.textContent = '播放暂时中断，请刷新重试';
                message.classList.add('show');
            }
        } else {
            play();
        }

        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (wrapper) {
        var video = wrapper.querySelector('video');
        var overlay = wrapper.querySelector('.player-overlay');

        if (overlay) {
            overlay.addEventListener('click', function () {
                startPlayer(wrapper);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayer(wrapper);
                }
            });
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (overlay && video.currentTime === 0) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    });
})();
