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


