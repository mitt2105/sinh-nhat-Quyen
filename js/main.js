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

  // Audio: expose progress beside the toggle, and never leave a pending play
  // request without a useful result for the visitor.
  const audio = $("#birthdayMusic");
  const musicToggle = $("#musicToggle");
  const musicLabel = $("#musicLabel");
  const audioStatus = $("#audioStatus");
  const audioNotice = $("#audioNotice");
  let playAttempt = 0;
  let playPending = false;
  let playTimer;

  const setAudioState = (playing, message) => {
    musicToggle.setAttribute("aria-pressed", String(playing));
    musicLabel.textContent = playing ? "Tắt nhạc" : "Bật nhạc";
    audioStatus.textContent = message;
    if (audioNotice) {
      audioNotice.textContent = message;
      audioNotice.hidden = !message;
    }
  };

  const playbackErrorMessage = () => {
    const code = audio.error?.code;
    if (code === 2) return "Không tải được nhạc do lỗi mạng. Hãy kiểm tra kết nối rồi thử lại.";
    if (code === 3 || code === 4) return "Không đọc được tệp birthday.mp3. Tệp nhạc trên máy chủ có thể bị hỏng.";
    return "Trình duyệt chưa thể phát nhạc. Hãy thử lại hoặc kiểm tra âm lượng thiết bị.";
  };

  musicToggle.addEventListener("click", async () => {
    if (playPending) {
      playAttempt += 1;
      playPending = false;
      window.clearTimeout(playTimer);
      audio.pause();
      setAudioState(false, "Đã hủy yêu cầu phát nhạc.");
      return;
    }
    if (!audio.paused) {
      audio.pause();
      return;
    }

    const attempt = ++playAttempt;
    playPending = true;
    setAudioState(false, "Đang tải nhạc…");
    try {
      // Call play() in the user gesture so mobile browser activation is kept.
      const playRequest = audio.play();
      if (!playRequest || typeof playRequest.then !== "function") {
        playTimer = window.setTimeout(() => {
          if (attempt === playAttempt && audio.paused) {
            playPending = false;
            setAudioState(false, playbackErrorMessage());
          }
        }, 15000);
        return;
      }

      const timeout = new Promise((_, reject) => {
        playTimer = window.setTimeout(() => {
          const error = new Error("PLAYBACK_TIMEOUT");
          reject(error);
        }, 15000);
      });
      await Promise.race([playRequest, timeout]);
      if (attempt === playAttempt && !audio.paused) {
        playPending = false;
        setAudioState(true, "Nhạc đang phát ♫");
      }
    } catch (error) {
      if (attempt !== playAttempt) return;
      playPending = false;
      if (error?.message === "PLAYBACK_TIMEOUT") {
        console.warn("Birthday audio playback timed out.");
        setAudioState(false, "Nhạc tải quá lâu nên chưa phát. Hãy kiểm tra kết nối rồi nhấn “Bật nhạc” để thử lại.");
      } else {
        console.error("Birthday audio playback failed:", error);
        setAudioState(false, playbackErrorMessage());
      }
    } finally {
      window.clearTimeout(playTimer);
    }
  });

  audio.addEventListener("loadstart", () => {
    if (audio.paused && !playPending) audioStatus.textContent = "Đang kết nối tới tệp nhạc…";
  });
  audio.addEventListener("canplay", () => {
    if (audio.paused && !playPending) {
      const message = "Đã sẵn sàng. Nhấn “Bật nhạc” để nghe.";
      audioStatus.textContent = message;
    }
  });
  audio.addEventListener("waiting", () => {
    if (playPending || !audio.paused) setAudioState(false, "Nhạc đang tải chậm. Vui lòng chờ trong giây lát…");
  });
  audio.addEventListener("stalled", () => {
    if (playPending || !audio.paused) setAudioState(false, "Kết nối nhạc bị gián đoạn. Đang chờ dữ liệu…");
  });
  audio.addEventListener("playing", () => {
    playPending = false;
    setAudioState(true, "Nhạc đang phát ♫");
  });
  audio.addEventListener("pause", () => {
    if (audio.error) setAudioState(false, playbackErrorMessage());
    else if (!playPending) setAudioState(false, "Nhạc đang tạm dừng.");
  });
  audio.addEventListener("ended", () => setAudioState(false, "Bản nhạc đã kết thúc."));
  audio.addEventListener("error", () => {
    playPending = false;
    playAttempt += 1;
    window.clearTimeout(playTimer);
    setAudioState(false, playbackErrorMessage());
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