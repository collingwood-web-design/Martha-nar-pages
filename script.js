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

  const filenameFromUrl = (url, fallback = "audio.mp3") => {
    try {
      const name = new URL(url).pathname.split("/").pop();
      return name || fallback;
    } catch {
      return fallback;
    }
  };

  const downloadAudio = async (src, filename, triggerEl) => {
    const originalLabel = triggerEl.textContent;
    triggerEl.disabled = true;
    triggerEl.textContent = "Preparing…";

    try {
      const response = await fetch(src, { mode: "cors", credentials: "omit" });
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
      URL.revokeObjectURL(objectUrl);
      triggerEl.textContent = "Downloaded";
      window.setTimeout(() => {
        triggerEl.textContent = originalLabel;
        triggerEl.disabled = false;
      }, 1600);
    } catch (error) {
      console.error(error);
      triggerEl.textContent = "Retry download";
      triggerEl.disabled = false;
      window.alert(
        "We couldn’t download that file in-page. Please try again, or use Listen and save from the player menu."
      );
    }
  };

  document.querySelectorAll("[data-audio-download]").forEach((btn) => {
    btn.addEventListener("click", () => {
      downloadAudio(
        btn.dataset.audioSrc,
        btn.dataset.audioFilename || filenameFromUrl(btn.dataset.audioSrc),
        btn
      );
    });
  });

  const playButtons = document.querySelectorAll("[data-audio-play]");
  if (!playButtons.length && !document.querySelectorAll("[data-audio-download]").length) {
    return;
  }

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
      <button type="button" class="btn btn--small audio-modal__download">Download MP3</button>
    </div>
  `;
  document.body.appendChild(modal);

  const titleEl = modal.querySelector("#audio-modal-title");
  const audioEl = modal.querySelector(".audio-modal__player");
  const downloadEl = modal.querySelector(".audio-modal__download");
  const closeBtn = modal.querySelector(".audio-modal__close");
  let currentSrc = "";
  let currentFilename = "audio.mp3";

  const closeModal = () => {
    audioEl.pause();
    modal.classList.remove("is-open");
    modal.hidden = true;
  };

  const openModal = (title, src) => {
    titleEl.textContent = title;
    currentSrc = src;
    currentFilename = filenameFromUrl(src);
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

  downloadEl.addEventListener("click", () => {
    if (!currentSrc) return;
    downloadAudio(currentSrc, currentFilename, downloadEl);
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
