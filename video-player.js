(() => {
  const dialog = document.querySelector("#video-lightbox");
  if (!dialog || dialog.dataset.ready) return;
  dialog.dataset.ready = "true";

  const player = dialog.querySelector(".video-lightbox-player");
  const stage = dialog.querySelector(".video-lightbox-stage");
  const fullscreenTarget = dialog.querySelector(".video-lightbox-panel");
  const title = dialog.querySelector("#video-lightbox-title");
  const status = dialog.querySelector(".video-lightbox-status");
  const fullscreenButton = dialog.querySelector("[data-video-fullscreen]");
  let trigger;
  let original;
  let startTime = 0;
  let frame = 0;

  function fitPlayer() {
    if (!dialog.open || !player.videoWidth || !player.videoHeight) return;
    const bounds = stage.getBoundingClientRect();
    const scale = Math.min(bounds.width / player.videoWidth, bounds.height / player.videoHeight);
    if (scale <= 0) return;
    // Use decoded display dimensions, including orientation metadata. Never
    // substitute a fixed landscape/portrait ratio or crop the source image.
    player.style.width = `${player.videoWidth * scale}px`;
    player.style.height = `${player.videoHeight * scale}px`;
    player.style.visibility = "visible";
  }

  function scheduleFit() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(fitPlayer);
  }

  function setInlineRatio(video) {
    if (video.videoWidth && video.videoHeight) {
      video.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
    }
  }

  document.querySelectorAll(".trial-video-card video[controls]").forEach((video) => {
    video.addEventListener("loadedmetadata", () => setInlineRatio(video));
    setInlineRatio(video);
  });

  document.addEventListener("play", (event) => {
    if (!(event.target instanceof HTMLVideoElement)) return;
    document.querySelectorAll("video").forEach((video) => {
      if (video !== event.target && !video.paused) video.pause();
    });
  }, true);

  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-video-expand]");
    if (!button) return;
    const card = button.closest(".trial-video-card");
    const video = card?.querySelector("video[controls]");
    const source = video?.currentSrc || video?.querySelector("source")?.src;
    if (!source) return;

    trigger = button;
    original = video;
    startTime = Number.isFinite(video.currentTime) ? video.currentTime : 0;
    video.pause();
    title.textContent = card.querySelector("h2")?.textContent || "作品播放";
    player.setAttribute("aria-label", title.textContent);
    player.style.visibility = "hidden";
    player.style.removeProperty("width");
    player.style.removeProperty("height");
    status.textContent = "正在加载视频…";
    status.hidden = false;
    player.poster = video.poster;
    player.volume = video.volume;
    player.muted = video.muted;
    player.playbackRate = video.playbackRate;
    player.src = source;
    dialog.showModal();
    document.body.classList.add("video-viewer-open");
    player.load();
    // Keep play within the opening user gesture for mobile browsers. If the
    // browser declines autoplay, its native controls remain available.
    player.play().catch(() => {});
  });

  player.addEventListener("loadedmetadata", () => {
    if (startTime > 0 && Number.isFinite(player.duration) && startTime < player.duration) {
      player.currentTime = startTime;
    }
    status.hidden = true;
    fitPlayer();
  });
  player.addEventListener("resize", scheduleFit);
  player.addEventListener("error", () => {
    if (!dialog.open) return;
    status.textContent = "视频暂时无法加载，请稍后重试。";
    status.hidden = false;
  });

  dialog.querySelector("[data-video-close]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    if (document.fullscreenElement && dialog.contains(document.fullscreenElement)) document.exitFullscreen().catch(() => {});
    if (original && player.readyState >= 1 && Number.isFinite(player.currentTime)) {
      original.currentTime = player.currentTime;
    }
    player.pause();
    player.removeAttribute("src");
    player.load();
    document.body.classList.remove("video-viewer-open");
    trigger?.focus({ preventScroll: true });
    original = null;
  });

  fullscreenButton.hidden = !fullscreenTarget.requestFullscreen && !player.webkitEnterFullscreen;
  fullscreenButton.addEventListener("click", () => {
    if (fullscreenTarget.requestFullscreen) {
      fullscreenTarget.requestFullscreen().then(scheduleFit).catch(() => {});
    } else if (player.webkitEnterFullscreen) {
      player.webkitEnterFullscreen();
    }
  });
  document.addEventListener("fullscreenchange", scheduleFit);
  window.addEventListener("resize", scheduleFit);
  window.visualViewport?.addEventListener("resize", scheduleFit);
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(scheduleFit).observe(stage);
})();
