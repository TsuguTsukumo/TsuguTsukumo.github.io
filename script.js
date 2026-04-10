const animatedElements = document.querySelectorAll("[data-animate]");

if ("IntersectionObserver" in window && animatedElements.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.2 }
  );

  animatedElements.forEach((el) => observer.observe(el));
} else {
  animatedElements.forEach((el) => el.classList.add("visible"));
}

const galleryModal = document.querySelector("[data-gallery-lightbox]");
const galleryModalImage = document.querySelector("[data-gallery-lightbox-image]");
const galleryModalCaption = document.querySelector("[data-gallery-lightbox-caption]");
const galleryTriggers = document.querySelectorAll("[data-gallery-modal]");

if (galleryModal && galleryModalImage && galleryModalCaption && galleryTriggers.length > 0) {
  const closeGalleryModal = () => {
    galleryModal.classList.remove("is-open");
    galleryModal.hidden = true;
    document.body.classList.remove("modal-open");
  };

  const openGalleryModal = (trigger) => {
    galleryModalImage.src = trigger.dataset.gallerySrc || "";
    galleryModalImage.alt = trigger.dataset.galleryAlt || "";
    galleryModalCaption.textContent = trigger.dataset.galleryCaption || trigger.dataset.galleryAlt || "";
    galleryModal.hidden = false;
    galleryModal.classList.add("is-open");
    document.body.classList.add("modal-open");
  };

  galleryTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => openGalleryModal(trigger));
  });

  galleryModal.addEventListener("click", (event) => {
    if (event.target === galleryModal || event.target.closest("[data-gallery-close]")) {
      closeGalleryModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !galleryModal.hidden) {
      closeGalleryModal();
    }
  });
}
