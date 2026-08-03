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
      <a class="btn btn--small audio-modal__download" href="#" target="_blank" rel="noopener noreferrer">Download MP3</a>
    </div>
  `;
  document.body.appendChild(modal);

  const titleEl = modal.querySelector("#audio-modal-title");
  const audioEl = modal.querySelector(".audio-modal__player");
  const downloadEl = modal.querySelector(".audio-modal__download");
  const closeBtn = modal.querySelector(".audio-modal__close");

  const closeModal = () => {
    audioEl.pause();
    modal.classList.remove("is-open");
    modal.hidden = true;
  };

  const openModal = (title, src) => {
    titleEl.textContent = title;
    audioEl.src = src;
    downloadEl.href = src;
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
