(function () {
  "use strict";

  function initFeaturedCollections() {
    if (typeof window.SwipeCarousel === "undefined") {
      setTimeout(initFeaturedCollections, 50);
      return;
    }

    document
      .querySelectorAll(".shopify-section--featured-collections")
      .forEach(function (section) {
        if (!section.id) return;

        const grid = section.querySelector(".featured-collections-grid");
        const dots = section.querySelectorAll(".featured-collections-dot");

        if (!grid || dots.length === 0) return;

        window.SwipeCarousel.init({
          container: section,
          gridSelector: ".featured-collections-grid",
          cardSelector: ".featured-collection-card",
          dotSelector: ".featured-collections-dot",
          breakpoint: 699,
          gap: 16,
          activeClass: "active",
        });
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFeaturedCollections);
  } else {
    initFeaturedCollections();
  }
})();
