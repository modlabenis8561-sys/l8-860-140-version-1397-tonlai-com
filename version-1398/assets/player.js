(function () {
  function attachStream(video, stream) {
    if (!stream || video.dataset.ready === '1') {
      return;
    }

    video.dataset.ready = '1';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(stream);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }

    video.src = stream;
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');

    if (!video) {
      return;
    }

    var stream = video.getAttribute('data-stream') || '';

    attachStream(video, stream);

    function playVideo() {
      attachStream(video, stream);

      if (button) {
        button.classList.add('is-hidden');
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
  });
})();
