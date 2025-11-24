/**
 * Choose Shade Carousel Functionality
 * Uses theme's effect-carousel for swipe support (same as Our Looks)
 */
(function() {
  'use strict';

  function defineProductCarousel() {
    if (window.customElements.get('choose-shade-carousel')) {
      return;
    }

    const EffectCarousel = window.customElements.get('effect-carousel');
    if (!EffectCarousel) {
      console.warn('effect-carousel not found. Choose Shade carousel may not work properly.');
      return;
    }

    class ChooseShadeCarousel extends EffectCarousel {
      connectedCallback() {
        super.connectedCallback();
        this._setupChangeEvent();
      }

      _setupChangeEvent() {
        // Listen for slide changes
        const observer = new MutationObserver(() => {
          this.dispatchEvent(new CustomEvent('change', { bubbles: true }));
        });

        const slides = this.querySelectorAll(this.getAttribute('cell-selector') || '.choose-shade-section__product-slide');
        slides.forEach(slide => {
          observer.observe(slide, { attributes: true, attributeFilter: ['class'] });
        });
      }

      createOnChangeAnimationControls(fromSlide, toSlide) {
        // Simple fade transition
        const animationDuration = 300;

        return {
          leaveControls: () => fromSlide.animate([
            { opacity: 1 },
            { opacity: 0 }
          ], { duration: animationDuration, easing: 'ease-in-out' }),

          enterControls: () => toSlide.animate([
            { opacity: 0 },
            { opacity: 1 }
          ], { duration: animationDuration, easing: 'ease-in-out' })
        };
      }
    }

    window.customElements.define('choose-shade-carousel', ChooseShadeCarousel);
  }

  function defineImageCarousel() {
    if (window.customElements.get('choose-shade-image-carousel')) {
      return;
    }

    const EffectCarousel = window.customElements.get('effect-carousel');
    if (!EffectCarousel) {
      console.warn('effect-carousel not found. Choose Shade image carousel may not work properly.');
      return;
    }

    class ChooseShadeImageCarousel extends EffectCarousel {
      connectedCallback() {
        super.connectedCallback();
        this._setupChangeEvent();
        // Select first slide using parent method after connection
        setTimeout(() => {
          if (typeof this.select === "function" && this.cells && this.cells.length > 0) {
            this.select(0, { instant: true });
          }
        }, 50);
      }

      _setupChangeEvent() {
        // Listen for slide changes
        const observer = new MutationObserver(() => {
          this.dispatchEvent(new CustomEvent('change', { bubbles: true }));
        });

        const slides = this.querySelectorAll(this.getAttribute('cell-selector') || '.choose-shade-section__image-slide');
        slides.forEach(slide => {
          observer.observe(slide, { attributes: true, attributeFilter: ['class'] });
        });
      }

      createOnChangeAnimationControls(fromSlide, toSlide) {
        // Simple fade transition for images
        const animationDuration = 250;

        return {
          leaveControls: () => fromSlide.animate([
            { opacity: 1 },
            { opacity: 0 }
          ], { duration: animationDuration, easing: 'ease-in-out' }),

          enterControls: () => toSlide.animate([
            { opacity: 0 },
            { opacity: 1 }
          ], { duration: animationDuration, easing: 'ease-in-out' })
        };
      }
    }

    window.customElements.define('choose-shade-image-carousel', ChooseShadeImageCarousel);
  }

  function init() {
    defineProductCarousel();
    defineImageCarousel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
