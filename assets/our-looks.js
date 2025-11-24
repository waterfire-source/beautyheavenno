(function () {
  "use strict";

  function initMainCarousel(carouselElement) {
    if (!carouselElement) return;

    const prevButton = carouselElement.querySelector('[data-action="prev"]');
    const nextButton = carouselElement.querySelector('[data-action="next"]');

    if (prevButton) {
      prevButton.addEventListener("click", function () {
        if (typeof carouselElement.previous === "function") {
          carouselElement.previous();
        }
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        if (typeof carouselElement.next === "function") {
          carouselElement.next();
        }
      });
    }
  }

  function initImageCarousel(carouselElement) {
    if (!carouselElement) return;

    const prevButton = carouselElement.querySelector(
      '[data-action="prev-image"]'
    );
    const nextButton = carouselElement.querySelector(
      '[data-action="next-image"]'
    );
    const slideElement = carouselElement.closest(".our-looks__slide");
    const paginationDots = slideElement
      ? slideElement.querySelectorAll(".our-looks__image-dot")
      : [];

    if (prevButton) {
      prevButton.addEventListener("click", function (e) {
        e.stopPropagation();
        if (typeof carouselElement.previous === "function") {
          carouselElement.previous();
        }
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", function (e) {
        e.stopPropagation();
        if (typeof carouselElement.next === "function") {
          carouselElement.next();
        }
      });
    }

    paginationDots.forEach(function (dot, index) {
      dot.addEventListener("click", function (e) {
        e.stopPropagation();
        if (typeof carouselElement.select === "function") {
          carouselElement.select(index);
        }
      });
    });

    carouselElement.addEventListener("carousel:settle", function (e) {
      paginationDots.forEach(function (dot, index) {
        if (index === e.detail.index) {
          dot.classList.add("active");
        } else {
          dot.classList.remove("active");
        }
      });
    });
  }

  function defineMainCarousel() {
    if (window.customElements.get("our-looks-carousel")) {
      return;
    }

    const EffectCarousel = window.customElements.get("effect-carousel");
    if (!EffectCarousel) {
      console.warn(
        "effect-carousel not found. Our Looks carousel may not work properly."
      );
      return;
    }

    class OurLooksCarousel extends EffectCarousel {
      connectedCallback() {
        super.connectedCallback();
        initMainCarousel(this);
      }
    }

    window.customElements.define("our-looks-carousel", OurLooksCarousel);
  }

  function defineImageCarousel() {
    if (window.customElements.get("our-looks-image-carousel")) {
      return;
    }

    const EffectCarousel = window.customElements.get("effect-carousel");
    if (!EffectCarousel) {
      console.warn(
        "effect-carousel not found. Our Looks image carousel may not work properly."
      );
      return;
    }

    class OurLooksImageCarousel extends EffectCarousel {
      connectedCallback() {
        super.connectedCallback();
        initImageCarousel(this);
      }
    }

    window.customElements.define(
      "our-looks-image-carousel",
      OurLooksImageCarousel
    );
  }

  function init() {
    defineMainCarousel();
    defineImageCarousel();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
