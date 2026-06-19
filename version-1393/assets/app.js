(() => {
    const navToggle = document.querySelector('[data-nav-toggle]');
    const navMenu = document.querySelector('[data-nav-menu]');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        const show = (index) => {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach((slide, position) => {
                slide.classList.toggle('is-active', position === current);
            });

            dots.forEach((dot, position) => {
                dot.classList.toggle('is-active', position === current);
            });
        };

        const start = () => {
            window.clearInterval(timer);
            timer = window.setInterval(() => show(current + 1), 6500);
        };

        prev?.addEventListener('click', () => {
            show(current - 1);
            start();
        });

        next?.addEventListener('click', () => {
            show(current + 1);
            start();
        });

        dots.forEach((dot, position) => {
            dot.addEventListener('click', () => {
                show(position);
                start();
            });
        });

        start();
    }

    const searchInputs = document.querySelectorAll('[data-grid-search]');

    searchInputs.forEach((input) => {
        const section = input.closest('section');
        const grid = section?.querySelector('[data-filter-grid]');

        if (!grid) {
            return;
        }

        const items = Array.from(grid.children);

        input.addEventListener('input', () => {
            const value = input.value.trim().toLowerCase();

            items.forEach((item) => {
                const haystack = item.getAttribute('data-filter-text') || item.textContent.toLowerCase();
                item.classList.toggle('is-hidden', value.length > 0 && !haystack.includes(value));
            });
        });
    });

    const players = document.querySelectorAll('.video-player');

    players.forEach((player) => {
        const video = player.querySelector('video');
        const overlay = player.querySelector('.player-overlay');
        const status = player.querySelector('.player-status');
        const src = player.getAttribute('data-src');
        let hls = null;
        let ready = false;

        const setStatus = (text) => {
            if (!status) {
                return;
            }

            status.textContent = text;
            player.classList.toggle('has-status', Boolean(text));
        };

        const init = () => {
            if (!video || !src || ready) {
                return;
            }

            ready = true;
            setStatus('加载中');

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, () => setStatus(''));
                hls.on(window.Hls.Events.ERROR, (_event, data) => {
                    if (data && data.fatal) {
                        setStatus('视频加载失败');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                video.addEventListener('loadedmetadata', () => setStatus(''), { once: true });
            } else {
                video.src = src;
                setStatus('当前浏览器不支持该播放格式');
            }
        };

        const play = () => {
            init();

            if (!video) {
                return;
            }

            const promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(() => setStatus('点击视频区域继续播放'));
            }
        };

        overlay?.addEventListener('click', play);

        video?.addEventListener('click', () => {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });

        video?.addEventListener('play', () => {
            player.classList.add('is-playing');
            setStatus('');
        });

        video?.addEventListener('pause', () => {
            player.classList.remove('is-playing');
        });

        window.addEventListener('pagehide', () => {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
