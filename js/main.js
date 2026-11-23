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

  // Try autoplay on arrival; if browser policy blocks it, keep the control
  // available and explain the next step in a visible message.
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

  const playAudio = async (automatic = false) => {
    const attempt = ++playAttempt;
    playPending = true;
    setAudioState(false, automatic ? "Đang thử tự phát nhạc…" : "Đang tải nhạc…");
    try {
      // Invoke play immediately from the click path to preserve mobile activation.
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
        playTimer = window.setTimeout(() => reject(new Error("PLAYBACK_TIMEOUT")), 15000);
      });
      await Promise.race([playRequest, timeout]);
      if (attempt === playAttempt && !audio.paused) {
        playPending = false;
        setAudioState(true, "Nhạc đang phát ♫");
      }
    } catch (error) {
      if (attempt !== playAttempt) return;
      playPending = false;
      if (automatic && error?.name === "NotAllowedError") {
        setAudioState(false, "Trình duyệt chặn tự phát nhạc. Chạm “Bật nhạc” để nghe.");
      } else if (error?.message === "PLAYBACK_TIMEOUT") {
        console.warn("Birthday audio playback timed out.");
        setAudioState(false, "Nhạc tải quá lâu nên chưa phát. Hãy kiểm tra kết nối rồi nhấn “Bật nhạc” để thử lại.");
      } else if (error?.name === "AbortError") {
        setAudioState(false, "Yêu cầu phát nhạc đã bị hủy. Chạm “Bật nhạc” để thử lại.");
      } else {
        console.error("Birthday audio playback failed:", error);
        setAudioState(false, playbackErrorMessage());
      }
    } finally {
      window.clearTimeout(playTimer);
    }
  };

  musicToggle.addEventListener("click", () => {
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
    playAudio(false);
  });

  audio.addEventListener("loadstart", () => {
    if (audio.paused && !playPending) audioStatus.textContent = "Đang kết nối tới tệp nhạc…";
  });
  audio.addEventListener("canplay", () => {
    if (audio.paused && !playPending) audioStatus.textContent = "Đã sẵn sàng. Nhấn “Bật nhạc” để nghe.";
  });
  audio.addEventListener("waiting", () => {
    if (playPending || !audio.paused) setAudioState(!audio.paused, "Nhạc đang tải chậm. Vui lòng chờ trong giây lát…");
  });
  audio.addEventListener("stalled", () => {
    if (playPending || !audio.paused) setAudioState(!audio.paused, "Kết nối nhạc bị gián đoạn. Đang chờ dữ liệu…");
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

  // This may be rejected by browser autoplay policy; playAudio reports that
  // case visibly, and the button remains the user-gesture fallback.
  playAudio(true);

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