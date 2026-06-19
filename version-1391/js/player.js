(function () {
  var hlsPromise = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (!hlsPromise) {
      hlsPromise = new Promise(function (resolve, reject) {
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
        script.onload = function () {
          resolve(window.Hls);
        };
        script.onerror = function () {
          reject(new Error("hls"));
        };
        document.head.appendChild(script);
      });
    }

    return hlsPromise;
  }

  function playVideo(video) {
    var result = video.play();

    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }

  window.startMoviePlayer = function (source, cover) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.querySelector("[data-player-overlay]");
    var started = false;

    if (!video || !source) {
      return;
    }

    if (cover) {
      video.setAttribute("poster", cover);
    }

    function activate() {
      if (started) {
        playVideo(video);
        return;
      }

      started = true;
      video.controls = true;

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        playVideo(video);
        return;
      }

      loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            playVideo(video);
          });
        } else {
          video.src = source;
          playVideo(video);
        }
      }).catch(function () {
        video.src = source;
        playVideo(video);
      });
    }

    if (overlay) {
      overlay.addEventListener("click", activate);
    }

    video.addEventListener("click", function () {
      if (!started) {
        activate();
      }
    });
  };
})();
