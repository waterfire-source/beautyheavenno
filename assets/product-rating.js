(function () {
  "use strict";

  if (window.productRatingScrollInitialized) return;
  window.productRatingScrollInitialized = true;

  const CONFIG = {
    selectors: {
      jdgmBadge: ".jdgm-prev-badge",
      jdgmStars: ".jdgm-prev-badge__stars",
      productRating: ".product-rating",
      nativeRating: "[data-native-rating]",
      scrollToReviews: '[data-scroll-to-reviews="true"]',
      reviewsAccordion: '[id*="product-reviews-accordion"]',
      reviewsTab: ".product-tabs__reviews",
      productCard: ".product-card",
      reviewsContent: ".product-tabs__reviews, #product-reviews-tab-content",
      jdgmClickable:
        '.jdgm-prev-badge, .jdgm-prev-badge__stars, .jdgm-prev-badge__text, [class*="jdgm-star"]',
    },
    scrollOffset: 100,
    scrollDelay: 150,
    retryDelays: [1000, 3000],
  };

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) =>
    context.querySelectorAll(selector);

  const isInsideExcluded = (element, excludeSelector) =>
    element?.closest(excludeSelector) !== null;

  const JdgmHandler = {
    observer: null,

    hideNativeRating(badge) {
      const container = badge?.closest(CONFIG.selectors.productRating);
      if (!container) return;

      const nativeRating = $(CONFIG.selectors.nativeRating, container);
      if (nativeRating) {
        nativeRating.style.display = "none";
      }
    },

    hasContent(badge) {
      return badge?.textContent?.trim() || $(CONFIG.selectors.jdgmStars, badge);
    },

    processExistingBadges() {
      $$(CONFIG.selectors.jdgmBadge).forEach((badge) => {
        if (this.hasContent(badge)) {
          this.hideNativeRating(badge);
        }
        this.observer?.observe(badge, { childList: true, subtree: true });
      });
    },

    init() {
      this.observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType !== Node.ELEMENT_NODE) continue;

            const badge = node.closest?.(CONFIG.selectors.jdgmBadge);
            if (badge && this.hasContent(badge)) {
              this.hideNativeRating(badge);
            }
          }
        }
      });

      this.processExistingBadges();
      this.observer.observe(document.body, { childList: true, subtree: true });
    },
  };

  const ReviewsScroller = {
    getTarget() {
      return (
        $(CONFIG.selectors.reviewsAccordion) || $(CONFIG.selectors.reviewsTab)
      );
    },

    expandIfClosed(target) {
      const details = $("details", target) || target.closest("details");
      if (details && !details.open) {
        details.open = true;
        details.setAttribute("aria-expanded", "true");
      }
    },

    scrollTo(target) {
      const rect = target.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const targetPosition = rect.top + scrollTop - CONFIG.scrollOffset;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    },

    navigate() {
      const target = this.getTarget();
      if (!target) return;

      this.expandIfClosed(target);
      setTimeout(() => this.scrollTo(target), CONFIG.scrollDelay);
    },
  };

  const EventHandlers = {
    handleRatingClick(e) {
      const ratingElement = e.target.closest(CONFIG.selectors.scrollToReviews);

      if (!ratingElement) return;
      if (isInsideExcluded(ratingElement, CONFIG.selectors.productCard)) return;
      if (isInsideExcluded(ratingElement, CONFIG.selectors.reviewsContent))
        return;

      e.preventDefault();
      e.stopPropagation();
      ReviewsScroller.navigate();
    },

    handleBadgeClick(e) {
      const badge = e.target.closest(CONFIG.selectors.jdgmClickable);

      if (!badge) return;
      if (isInsideExcluded(badge, CONFIG.selectors.productCard)) return;
      if (isInsideExcluded(badge, CONFIG.selectors.reviewsContent)) return;

      e.preventDefault();
      e.stopPropagation();
      ReviewsScroller.navigate();
    },

    init() {
      document.addEventListener(
        "click",
        this.handleRatingClick.bind(this),
        true
      );
      document.addEventListener(
        "click",
        this.handleBadgeClick.bind(this),
        true
      );
    },
  };

  const init = () => {
    JdgmHandler.init();
    EventHandlers.init();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  CONFIG.retryDelays.forEach((delay) => {
    setTimeout(() => JdgmHandler.processExistingBadges(), delay);
  });
})();
