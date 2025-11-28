(function () {
  "use strict";

  if (window.quickBuyModalEnhanced) return;
  window.quickBuyModalEnhanced = true;

  const CONFIG = {
    timing: {
      fast: 200,
      normal: 300,
      slow: 400,
      stagger: 50,
      frameDelay: 16,
      initialDelay: 80,
    },
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    selectors: {
      modal: ".quick-buy-modal",
      modalTag: "quick-buy-modal",
      content: ".quick-buy-modal__content",
      gallery: ".quick-buy-modal__gallery-wrapper",
      info: ".quick-buy-modal__info-wrapper",
      badges: ".quick-buy-modal__badges-row",
      rating: ".quick-buy-modal__rating",
      nativeRating: ".product-rating__native",
      availability:
        ".quick-buy-modal__availability, .quick-buy-modal__stock-status",
      trust: ".quick-buy-modal__trust",
      detailsLink:
        ".quick-buy-modal__details-link, .quick-buy-modal__view-more",
      closeButton: ".quick-buy-modal__close-button",
    },
    animations: {
      slideFromLeft: "translateX(-15px)",
      slideFromRight: "translateX(15px)",
      slideFromBottom: "translateY(8px)",
      scaleDown: "scale(0.98)",
      reset: "translateY(0) translateX(0) scale(1)",
    },
  };

  const $ = (selector, context = document) => context.querySelector(selector);

  const AnimationEngine = {
    createTransition(duration, easing = CONFIG.easing) {
      return `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
    },

    setInitialState(element, transform) {
      if (!element) return;
      Object.assign(element.style, {
        opacity: "0",
        transform: transform,
        transition: "none",
      });
    },

    animateTo(element, delay = 0) {
      if (!element) return;

      requestAnimationFrame(() => {
        setTimeout(() => {
          element.style.transition = this.createTransition(
            CONFIG.timing.normal
          );
          element.style.opacity = "1";
          element.style.transform = CONFIG.animations.reset;
        }, delay);
      });
    },

    animate(element, fromTransform, delay = 0) {
      this.setInitialState(element, fromTransform);
      this.animateTo(element, delay);
    },

    fadeOut(element) {
      if (!element) return;
      element.style.transition = this.createTransition(
        CONFIG.timing.fast,
        "ease"
      );
      element.style.opacity = "0";
      element.style.transform = CONFIG.animations.scaleDown;
    },
  };

  const ModalAnimator = {
    getElements(modal) {
      const { selectors } = CONFIG;
      return {
        content: $(selectors.content, modal),
        gallery: $(selectors.gallery, modal),
        info: $(selectors.info, modal),
        badges: $(selectors.badges, modal),
        rating: $(selectors.rating, modal),
        nativeRating: $(selectors.nativeRating, modal),
        availability: $(selectors.availability, modal),
        trust: $(selectors.trust, modal),
        detailsLink: $(selectors.detailsLink, modal),
      };
    },

    ensureRatingVisibility(elements) {
      if (elements.nativeRating) {
        elements.nativeRating.style.display = "flex";
      }
      if (elements.rating) {
        elements.rating.style.display = "block";
      }
    },

    animateContent(content) {
      if (!content) return;

      AnimationEngine.setInitialState(content, CONFIG.animations.scaleDown);

      requestAnimationFrame(() => {
        content.style.transition = AnimationEngine.createTransition(
          CONFIG.timing.slow
        );
        content.style.opacity = "1";
        content.style.transform = "scale(1)";
      });
    },

    animateSequence(elements) {
      const { animations, timing } = CONFIG;
      let delay = timing.initialDelay;

      const sequence = [
        {
          el: elements.gallery,
          transform: animations.slideFromLeft,
          staggerMultiplier: 2,
        },
        {
          el: elements.info,
          transform: animations.slideFromRight,
          staggerMultiplier: 2,
        },
        {
          el: elements.badges,
          transform: animations.slideFromBottom,
          staggerMultiplier: 1,
        },
        {
          el: elements.rating,
          transform: animations.slideFromBottom,
          staggerMultiplier: 1,
        },
        {
          el: elements.availability,
          transform: animations.slideFromBottom,
          staggerMultiplier: 1,
        },
        {
          el: elements.trust,
          transform: animations.slideFromBottom,
          staggerMultiplier: 1,
        },
        {
          el: elements.detailsLink,
          transform: animations.slideFromBottom,
          staggerMultiplier: 0,
        },
      ];

      sequence.forEach(({ el, transform, staggerMultiplier }) => {
        if (!el) return;
        AnimationEngine.animate(el, transform, delay);
        delay += timing.stagger * staggerMultiplier;
      });
    },

    open(modal) {
      const elements = this.getElements(modal);

      this.ensureRatingVisibility(elements);
      this.animateContent(elements.content);
      this.animateSequence(elements);
    },

    close(modal) {
      const content = $(CONFIG.selectors.content, modal);
      AnimationEngine.fadeOut(content);
    },
  };

  const ModalObserver = {
    observer: null,

    findModal(node) {
      if (node.nodeType !== Node.ELEMENT_NODE) return null;
      if (node.classList?.contains("quick-buy-modal")) return node;
      return node.querySelector?.(CONFIG.selectors.modal);
    },

    handleMutation(mutation) {
      for (const node of mutation.addedNodes) {
        const modal = this.findModal(node);
        if (modal) {
          setTimeout(() => ModalAnimator.open(modal), CONFIG.timing.frameDelay);
        }
      }
    },

    init() {
      this.observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => this.handleMutation(mutation));
      });

      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    },

    destroy() {
      this.observer?.disconnect();
      this.observer = null;
    },
  };

  const EventController = {
    handleClick(e) {
      const closeBtn = e.target.closest(CONFIG.selectors.closeButton);
      if (!closeBtn) return;

      const modal = closeBtn.closest(CONFIG.selectors.modalTag);
      if (modal) ModalAnimator.close(modal);
    },

    handleKeydown(e) {
      if (e.key !== "Escape") return;

      const modal = $(CONFIG.selectors.modalTag);
      if (modal) ModalAnimator.close(modal);
    },

    init() {
      document.addEventListener("click", this.handleClick.bind(this));
      document.addEventListener("keydown", this.handleKeydown.bind(this));
    },
  };

  const init = () => {
    ModalObserver.init();
    EventController.init();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
