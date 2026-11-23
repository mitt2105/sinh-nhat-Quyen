(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const lightbox = $("#lightbox");
  const image = $("#lightboxImage");
  const caption = $("#lightboxCaption");

  document.querySelectorAll(".memory").forEach((button) => {
    button.addEventListener("click", () => {
      image.src = button.dataset.full;
      image.alt = $("img", button).alt;
      caption.textContent = $(" .memory-caption", button).textContent;
      lightbox.showModal();
    });
  });
  $("#closeLightbox").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });

  const audio = $("#birthdayMusic");
  const musicToggle = $("#musicToggle");
  const musicLabel = $("#musicLabel");
  const audioStatus = $("#audioStatus");
  musicToggle.addEventListener("click", async () => {
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        audioStatus.textContent = "Không thể phát nhạc lúc này. Hãy thử lại nhé.";
      }
    } else {
      audio.pause();
    }
  });
  audio.addEventListener("play", () => {
    musicToggle.setAttribute("aria-pressed", "true");
    musicLabel.textContent = "Tắt nhạc";
    audioStatus.textContent = "Nhạc đang phát ♫";
  });
  audio.addEventListener("pause", () => {
    musicToggle.setAttribute("aria-pressed", "false");
    musicLabel.textContent = "Bật nhạc";
    audioStatus.textContent = "Nhạc đang tạm dừng.";
  });
  audio.addEventListener("error", () => {
    audioStatus.textContent = "Tệp nhạc hiện chưa tải được.";
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