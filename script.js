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

const gallerySlider = document.querySelector("[data-gallery-slider]");

if (gallerySlider) {
  const galleryImage = document.querySelector("[data-gallery-image]");
  const galleryIndex = document.querySelector("[data-gallery-index]");
  const galleryPrev = document.querySelector("[data-gallery-prev]");
  const galleryNext = document.querySelector("[data-gallery-next]");
  const galleryEmpty = document.querySelector("[data-gallery-empty]");
  const galleryFrame = document.querySelector("[data-gallery-frame]");
  const galleryControls = document.querySelector("[data-gallery-controls]");

  const galleryFolder = "gallery-photos/";
  const githubApi = "https://api.github.com/repos/TsuguTsukumo/TsuguTsukumo.github.io/contents/gallery-photos";
  const imagePattern = /\.(avif|gif|jpe?g|png|webp)$/i;
  let currentIndex = 0;
  let galleryFiles = [];

  const uniqueSorted = (files) => [...new Set(files)].sort((a, b) => a.localeCompare(b));

  const toLabel = (filePath) => {
    const fileName = decodeURIComponent(filePath.split("/").pop() || "");
    const bareName = fileName.replace(/\.[^.]+$/, "");
    return bareName.replace(/[-_]+/g, " ").trim() || fileName;
  };

  const updateButtons = () => {
    const disabled = galleryFiles.length <= 1;
    galleryPrev.disabled = disabled;
    galleryNext.disabled = disabled;
  };

  const showEmptyState = (message) => {
    galleryFrame.hidden = true;
    galleryControls.hidden = true;
    galleryEmpty.hidden = false;
    galleryEmpty.textContent = message;
  };

  const showSlider = () => {
    galleryFrame.hidden = false;
    galleryControls.hidden = false;
    galleryEmpty.hidden = true;
  };

  const renderSlide = () => {
    if (galleryFiles.length === 0) {
      showEmptyState("gallery-photos/ に画像が見つかりませんでした。");
      return;
    }

    showSlider();

    const activeFile = galleryFiles[currentIndex];
    galleryImage.src = activeFile;
    galleryImage.alt = toLabel(activeFile);
    galleryIndex.textContent = `${currentIndex + 1} / ${galleryFiles.length}`;
    updateButtons();
  };

  const normalizeLocalHref = (href) => {
    if (!href) {
      return null;
    }

    let normalizedHref = href.split("?")[0].split("#")[0];

    if (normalizedHref.startsWith("../") || normalizedHref.endsWith("/")) {
      return null;
    }

    if (normalizedHref.startsWith("http://") || normalizedHref.startsWith("https://")) {
      normalizedHref = normalizedHref.split("/").pop() || "";
    }

    if (normalizedHref.startsWith("/")) {
      normalizedHref = normalizedHref.split("/").pop() || "";
    }

    normalizedHref = normalizedHref.replace(/^\.\//, "");

    if (!imagePattern.test(normalizedHref)) {
      return null;
    }

    return normalizedHref.startsWith(galleryFolder) ? normalizedHref : `${galleryFolder}${normalizedHref}`;
  };

  const loadLocalDirectory = async () => {
    const response = await fetch(galleryFolder, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Local directory listing unavailable");
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const files = [...doc.querySelectorAll("a")]
      .map((link) => normalizeLocalHref(link.getAttribute("href") || ""))
      .filter(Boolean);

    if (files.length === 0) {
      throw new Error("No image files found in local directory");
    }

    return uniqueSorted(files);
  };

  const loadGithubDirectory = async () => {
    const response = await fetch(githubApi, {
      headers: {
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      throw new Error("GitHub directory listing unavailable");
    }

    const items = await response.json();
    const files = items
      .filter((item) => item.type === "file" && imagePattern.test(item.name))
      .map((item) => `${galleryFolder}${item.name}`);

    if (files.length === 0) {
      throw new Error("No image files found in GitHub directory");
    }

    return uniqueSorted(files);
  };

  const showNext = () => {
    if (galleryFiles.length <= 1) {
      return;
    }

    currentIndex = (currentIndex + 1) % galleryFiles.length;
    renderSlide();
  };

  const showPrev = () => {
    if (galleryFiles.length <= 1) {
      return;
    }

    currentIndex = (currentIndex - 1 + galleryFiles.length) % galleryFiles.length;
    renderSlide();
  };

  galleryPrev.addEventListener("click", showPrev);
  galleryNext.addEventListener("click", showNext);

  document.addEventListener("keydown", (event) => {
    if (!gallerySlider.closest("body")) {
      return;
    }

    if (event.key === "ArrowLeft") {
      showPrev();
    }

    if (event.key === "ArrowRight") {
      showNext();
    }
  });

  (async () => {
    try {
      galleryFiles = await loadLocalDirectory();
    } catch {
      try {
        galleryFiles = await loadGithubDirectory();
      } catch {
        galleryFiles = [];
      }
    }

    renderSlide();
  })();
}
