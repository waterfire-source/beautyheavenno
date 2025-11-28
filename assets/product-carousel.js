(() => {
  const carousel = document.querySelector(
    "#shopify-section-{{ section.id }} [data-carousel-track]"
  );
  if (!carousel) return;

  const prevBtn = document.querySelector(
    "#shopify-section-{{ section.id }} .product-carousel__nav--prev"
  );
  const nextBtn = document.querySelector(
    "#shopify-section-{{ section.id }} .product-carousel__nav--next"
  );
  const dotsContainer = document.querySelector(
    "#shopify-section-{{ section.id }} [data-carousel-dots]"
  );
  const slides = carousel.querySelectorAll(".product-carousel__slide");
  const productsPerView = section.settings.products_per_row;
  const gap = 24;

  if (!prevBtn || !nextBtn || slides.length <= productsPerView) return;

  let currentIndex = 0;
  const maxIndex = Math.ceil(slides.length / productsPerView) - 1;

  if (dotsContainer) {
    for (let i = 0; i <= maxIndex; i++) {
      const dot = document.createElement("button");
      dot.className = "product-carousel__dot";
      dot.setAttribute("aria-label", `Go to page ${i + 1}`);
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateCarousel() {
    const slideWidth = slides[0].offsetWidth;
    const scrollAmount = (slideWidth + gap) * productsPerView * currentIndex;
    carousel.style.transform = `translateX(-${scrollAmount}px)`;

    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll(".product-carousel__dot");
      dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentIndex);
      });
    }

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === maxIndex;
  }

  function goToSlide(index) {
    currentIndex = Math.max(0, Math.min(index, maxIndex));
    updateCarousel();
  }

  prevBtn.addEventListener("click", () => {
    goToSlide(currentIndex - 1);
  });

  nextBtn.addEventListener("click", () => {
    goToSlide(currentIndex + 1);
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateCarousel();
    }, 250);
  });

  updateCarousel();
})();
