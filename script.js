(() => {
  const faqs = document.querySelectorAll(".faq__item");

  faqs.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      faqs.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });

  const revealTargets = document.querySelectorAll(
    ".card, .affirm, .faq, .trust__item"
  );

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealTargets.forEach((el) => observer.observe(el));
  }

  const CDN_ORIGIN = "https://media.cwd-cdn.com/";
  const DOWNLOAD_ORIGIN = "https://media.cwd-cdn.com/dl/";

  const filenameFromUrl = (url, fallback = "audio.mp3") => {
    try {
      const name = new URL(url).pathname.split("/").pop();
      return name || fallback;
    } catch {
      return fallback;
    }
  };

  const toDownloadUrl = (src) => {
    if (!src) return src;
    if (src.startsWith(CDN_ORIGIN) && !src.startsWith(DOWNLOAD_ORIGIN)) {
      return DOWNLOAD_ORIGIN + src.slice(CDN_ORIGIN.length);
    }
    return src;
  };

  const downloadAudio = async (src, filename, triggerEl) => {
    const originalLabel = triggerEl.textContent;
    triggerEl.disabled = true;
    triggerEl.textContent = "Preparing…";

    try {
      const response = await fetch(toDownloadUrl(src), {
        mode: "cors",
        credentials: "omit",
      });
      if (!response.ok) {
        throw new Error(`Download failed (${response.status})`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename || filenameFromUrl(src);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
      triggerEl.textContent = "Downloaded";
      window.setTimeout(() => {
        triggerEl.textContent = originalLabel;
        triggerEl.disabled = false;
      }, 1600);
    } catch (error) {
      console.error("NARM download error:", error);
      triggerEl.textContent = "Retry download";
      triggerEl.disabled = false;
      window.alert(
        "Download failed. Please try again in a moment. If it keeps failing, use Listen to play the audio on this page."
      );
    }
  };

  document.querySelectorAll("[data-audio-download]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      downloadAudio(
        btn.dataset.audioSrc,
        btn.dataset.audioFilename || filenameFromUrl(btn.dataset.audioSrc),
        btn
      );
    });
  });

  const playButtons = document.querySelectorAll("[data-audio-play]");
  if (!playButtons.length) return;

  const modal = document.createElement("div");
  modal.className = "audio-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.hidden = true;
  modal.innerHTML = `
    <div class="audio-modal__panel">
      <div class="audio-modal__header">
        <h3 class="audio-modal__title" id="audio-modal-title"></h3>
        <button type="button" class="audio-modal__close" aria-label="Close player">&times;</button>
      </div>
      <audio class="audio-modal__player" controls preload="metadata"></audio>
    </div>
  `;
  document.body.appendChild(modal);

  const titleEl = modal.querySelector("#audio-modal-title");
  const audioEl = modal.querySelector(".audio-modal__player");
  const closeBtn = modal.querySelector(".audio-modal__close");

  const closeModal = () => {
    audioEl.pause();
    modal.classList.remove("is-open");
    modal.hidden = true;
  };

  const openModal = (title, src) => {
    titleEl.textContent = title;
    audioEl.src = src;
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add("is-open"));
    audioEl.play().catch(() => {});
  };

  playButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      openModal(btn.dataset.audioTitle || "Audio", btn.dataset.audioSrc);
    });
  });

  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
})();
