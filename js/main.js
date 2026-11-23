(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const lightbox = $("#lightbox");
  const image = $("#lightboxImage");
  const caption = $("#lightboxCaption");

  document.querySelectorAll(".memory").forEach((button) => {
    button.addEventListener("click", () => {
      image.src = button.dataset.full;
      image.alt = $("img", button).alt;
      caption.textContent = $(".memory-caption", button)?.textContent || "";
      lightbox.showModal();
    });
  });
  $("#closeLightbox").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });

  // Audio: show clear loading/playback/error states and support touch devices.
  const audio = $("#birthdayMusic");
  const musicToggle = $("#musicToggle");
  const musicLabel = $("#musicLabel");
  const audioStatus = $("#audioStatus");

  const setAudioState = (playing, message) => {
    musicToggle.setAttribute("aria-pressed", String(playing));
    musicLabel.textContent = playing ? "Tắt nhạc" : "Bật nhạc";
    audioStatus.textContent = message;
  };

  musicToggle.addEventListener("click", async () => {
    if (!audio.paused) {
      audio.pause();
      return;
    }

    setAudioState(false, "Đang tải nhạc…");
    try {
      // Calling play() directly inside the click handler preserves the
      // browser's user-activation permission on mobile and desktop.
      const playRequest = audio.play();
      if (playRequest && typeof playRequest.then === "function") {
        await playRequest;
      }
    } catch (error) {
      console.error("Birthday audio playback failed:", error);
      const code = audio.error?.code;
      const reason = code === 2
        ? "Lỗi mạng khi tải tệp nhạc. Hãy tải lại trang."
        : code === 3 || code === 4
          ? "Tệp MP3 không đọc được hoặc định dạng không được hỗ trợ."
          : "Trình duyệt chưa phát được nhạc. Hãy thử bấm lại hoặc kiểm tra âm lượng thiết bị.";
      setAudioState(false, reason);
    }
  });

  audio.addEventListener("loadstart", () => {
    if (audio.paused) audioStatus.textContent = "Đang kết nối tới tệp nhạc…";
  });
  audio.addEventListener("canplay", () => {
    if (audio.paused) audioStatus.textContent = "Đã sẵn sàng. Nhấn “Bật nhạc” để nghe.";
  });
  audio.addEventListener("playing", () => setAudioState(true, "Nhạc đang phát ♫"));
  audio.addEventListener("pause", () => setAudioState(false, "Nhạc đang tạm dừng."));
  audio.addEventListener("ended", () => setAudioState(false, "Bản nhạc đã kết thúc."));
  audio.addEventListener("error", () => {
    const code = audio.error?.code;
    const reason = code === 2
      ? "Không tải được tệp nhạc do lỗi mạng."
      : code === 3 || code === 4
        ? "Tệp birthday.mp3 bị lỗi hoặc không đúng định dạng MP3."
        : "Không tìm thấy tệp nhạc. Kiểm tra assets/music/birthday.mp3.";
    setAudioState(false, reason);
  });

  const countdown = $("#countdown");
  const birthday = new Date("2026-11-25T00:00:00+07:00");
  const updateCountdown = () => {
    const remaining = birthday.getTime() - Date.now();
    if (remaining <= 0) {
      countdown.textContent = "HÔM NAY LÀ NGÀY CỦA BẠN ✳";
      return;
    }
    const days = Math.ceil(remaining / 86400000);
    countdown.textContent = days === 1 ? "CÒN 1 NGÀY NỮA" : `CÒN ${days} NGÀY NỮA`;
  };
  updateCountdown();
  window.setInterval(updateCountdown, 3600000);
})();