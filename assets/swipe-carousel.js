(function () {
  "use strict";

  const SwipeCarousel = {
    /**
     * Initialize a swipe carousel
     * @param {Object} options - Configuration options
     * @param {HTMLElement|string} options.container - Container element or selector
     * @param {string} options.gridSelector - Selector for the scrollable grid
     * @param {string} options.cardSelector - Selector for individual cards/items
     * @param {string} options.dotSelector - Selector for pagination dots
     * @param {number} options.breakpoint - Max width in pixels for mobile mode (default: 699)
     * @param {number} options.gap - Gap between cards in pixels (default: 16)
     * @param {string} options.activeClass - Class name for active dot (default: 'active')
     */
    init: function (options) {
      const config = {
        container: options.container,
        gridSelector: options.gridSelector || ".carousel-grid",
        cardSelector: options.cardSelector || ".carousel-card",
        dotSelector: options.dotSelector || ".carousel-dot",
        breakpoint: options.breakpoint || 699,
        gap: options.gap || 16,
        activeClass: options.activeClass || "active",
      };

      // Get container element
      let container;
      if (typeof config.container === "string") {
        container = document.querySelector(config.container);
      } else {
        container = config.container;
      }

      if (!container) {
        console.warn("SwipeCarousel: Container not found");
        return null;
      }

      const grid = container.querySelector(config.gridSelector);
      const dots = container.querySelectorAll(config.dotSelector);

      if (!grid || dots.length === 0) {
        return null;
      }

      // Only run on mobile
      if (window.innerWidth > config.breakpoint) {
        return null;
      }

      const cards = grid.querySelectorAll(config.cardSelector);
      if (cards.length === 0) {
        return null;
      }

      /**
       * Update active dot based on scroll position
       */
      function updateActiveDot() {
        if (!grid || cards.length === 0) return;

        const scrollLeft = grid.scrollLeft;
        const cardWidth = cards[0].offsetWidth;
        const scrollPosition = scrollLeft + cardWidth / 2;

        let activeIndex = 0;
        cards.forEach((card, index) => {
          const cardLeft = index * (cardWidth + config.gap);
          const cardRight = cardLeft + cardWidth;

          if (scrollPosition >= cardLeft && scrollPosition < cardRight) {
            activeIndex = index;
          }
        });

        dots.forEach((dot, index) => {
          if (index === activeIndex) {
            dot.classList.add(config.activeClass);
          } else {
            dot.classList.remove(config.activeClass);
          }
        });
      }

      /**
       * Scroll to specific card index
       */
      function scrollToIndex(index) {
        if (!cards[index]) return;

        const cardWidth = cards[0].offsetWidth;
        const scrollTo = index * (cardWidth + config.gap);

        grid.scrollTo({
          left: scrollTo,
          behavior: "smooth",
        });

        // Update active dot immediately
        dots.forEach((d) => d.classList.remove(config.activeClass));
        if (dots[index]) {
          dots[index].classList.add(config.activeClass);
        }
      }

      // Handle scroll events
      let scrollTimeout;
      grid.addEventListener("scroll", function () {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateActiveDot, 100);
      });

      // Handle dot clicks
      dots.forEach((dot, index) => {
        dot.addEventListener("click", function () {
          scrollToIndex(index);
        });
      });

      // Initial update
      updateActiveDot();

      // Handle window resize
      let resizeTimeout;
      const resizeHandler = function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
          if (window.innerWidth <= config.breakpoint) {
            updateActiveDot();
          }
        }, 250);
      };

      window.addEventListener("resize", resizeHandler);

      // Return cleanup function
      return {
        destroy: function () {
          window.removeEventListener("resize", resizeHandler);
          grid.removeEventListener("scroll", updateActiveDot);
          dots.forEach((dot, index) => {
            dot.removeEventListener("click", scrollToIndex);
          });
        },
        scrollTo: scrollToIndex,
        update: updateActiveDot,
      };
    },

    /**
     * Auto-initialize all carousels with data attributes
     */
    autoInit: function () {
      const carousels = document.querySelectorAll("[data-swipe-carousel]");

      carousels.forEach(function (container) {
        const gridSelector =
          container.getAttribute("data-grid-selector") || ".carousel-grid";
        const cardSelector =
          container.getAttribute("data-card-selector") || ".carousel-card";
        const dotSelector =
          container.getAttribute("data-dot-selector") || ".carousel-dot";
        const breakpoint =
          parseInt(container.getAttribute("data-swipe-breakpoint")) || 699;
        const gap = parseInt(container.getAttribute("data-gap")) || 16;
        const activeClass =
          container.getAttribute("data-active-class") || "active";

        SwipeCarousel.init({
          container: container,
          gridSelector: gridSelector,
          cardSelector: cardSelector,
          dotSelector: dotSelector,
          breakpoint: breakpoint,
          gap: gap,
          activeClass: activeClass,
        });
      });
    },
  };

  // Auto-initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", SwipeCarousel.autoInit);
  } else {
    SwipeCarousel.autoInit();
  }

  // Export to global scope
  window.SwipeCarousel = SwipeCarousel;
})();

