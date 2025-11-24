(function () {
  "use strict";

  const initializedSections = new Set();

  function initChooseShade(sectionId) {
    const section = document.getElementById(`shopify-section-${sectionId}`);
    if (!section) return;

    // Prevent multiple initializations
    if (initializedSections.has(sectionId)) {
      return;
    }
    initializedSections.add(sectionId);

    // Initialize product carousel navigation with a slight delay to ensure carousel is ready
    setTimeout(function() {
      const productCarousel = section.querySelector("choose-shade-carousel");
      if (productCarousel) {
        // Check if already initialized
        if (productCarousel.hasAttribute('data-buttons-initialized')) {
          return;
        }
        productCarousel.setAttribute('data-buttons-initialized', 'true');

        const carouselId = productCarousel.getAttribute("id");
        const prevButton = section.querySelector(
          `.choose-shade-section__nav-button--prev[data-carousel-id="${carouselId}"]`
        );
        const nextButton = section.querySelector(
          `.choose-shade-section__nav-button--next[data-carousel-id="${carouselId}"]`
        );

        if (prevButton && nextButton) {
          const slides = productCarousel.querySelectorAll(
            ".choose-shade-section__product-slide"
          );

          // Previous button with loop
          prevButton.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();

            const currentIndex = Array.from(slides).findIndex((slide) =>
              slide.classList.contains("is-selected")
            );

            if (currentIndex <= 0) {
              // Loop to last slide
              if (typeof productCarousel.select === "function") {
                productCarousel.select(slides.length - 1);
              }
            } else {
              if (typeof productCarousel.previous === "function") {
                productCarousel.previous();
              }
            }
          });

          // Next button with loop
          nextButton.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();

            const currentIndex = Array.from(slides).findIndex((slide) =>
              slide.classList.contains("is-selected")
            );

            if (currentIndex >= slides.length - 1) {
              // Loop to first slide
              if (typeof productCarousel.select === "function") {
                productCarousel.select(0);
              }
            } else {
              if (typeof productCarousel.next === "function") {
                productCarousel.next();
              }
            }
          });
        }

        // Reset image carousel to first slide when product changes
        function resetImageCarouselToFirst(productSlide) {
          const imageCarousel = productSlide.querySelector('choose-shade-image-carousel');
          if (imageCarousel) {
            if (typeof imageCarousel.select === 'function') {
              imageCarousel.select(0, { instant: true });
            } else {
              // Fallback: manually set first slide
              const imageSlides = imageCarousel.querySelectorAll('.choose-shade-section__image-slide');
              imageSlides.forEach(function(imgSlide, index) {
                if (index === 0) {
                  imgSlide.classList.add('is-selected');
                } else {
                  imgSlide.classList.remove('is-selected');
                }
              });
            }
          }
        }

        // Listen for carousel:settle event (official event from effect-carousel)
        productCarousel.addEventListener('carousel:settle', function(event) {
          if (event.detail && event.detail.cell) {
            resetImageCarouselToFirst(event.detail.cell);
          }
        });

        // Also use MutationObserver as backup for when class changes
        const productSlides = productCarousel.querySelectorAll(".choose-shade-section__product-slide");
        const productObserver = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
              const slide = mutation.target;
              if (slide.classList.contains('is-selected')) {
                setTimeout(function() {
                  resetImageCarouselToFirst(slide);
                }, 50);
              }
            }
          });
        });

        productSlides.forEach(function(slide) {
          productObserver.observe(slide, { attributes: true, attributeFilter: ['class'] });
        });
      }
    }, 100);

    const products = section.querySelectorAll(
      ".choose-shade-section__product-slide[data-product-index]"
    );

    products.forEach(function (productElement) {
      const productIndex = productElement.getAttribute("data-product-index");
      const carouselId = `carousel-${sectionId}-${productIndex}`;
      const imageCarousel = productElement.querySelector(
        "choose-shade-image-carousel"
      );

      if (!imageCarousel) return;

      const slides = imageCarousel.querySelectorAll(
        ".choose-shade-section__image-slide"
      );

      if (slides.length === 0) return;

      function showSlide(index) {
        if (typeof imageCarousel.select === "function") {
          imageCarousel.select(index);
        } else {
          // Fallback: manually set selected class
          slides.forEach((slide, i) => {
            if (i === index) {
              slide.classList.add("is-selected");
            } else {
              slide.classList.remove("is-selected");
            }
          });
        }
      }

      // Force first slide selection after carousel initializes
      function ensureFirstSlideSelected() {
        // Use the carousel's select method if available
        if (typeof imageCarousel.select === "function") {
          imageCarousel.select(0, { instant: true });
        } else {
          // Fallback: manually set selected class
          slides.forEach((slide, i) => {
            if (i === 0) {
              slide.classList.add("is-selected");
            } else {
              slide.classList.remove("is-selected");
            }
          });
        }
      }

      // Wait for carousel to be fully connected
      if (customElements.get('choose-shade-image-carousel')) {
        customElements.whenDefined('choose-shade-image-carousel').then(() => {
          setTimeout(ensureFirstSlideSelected, 100);
        });
      } else {
        setTimeout(ensureFirstSlideSelected, 100);
      }

      // Initialize image carousel navigation buttons with slight delay
      setTimeout(function() {
        // Check if already initialized
        if (imageCarousel.hasAttribute('data-buttons-initialized')) {
          return;
        }
        imageCarousel.setAttribute('data-buttons-initialized', 'true');

        const prevImageButton = productElement.querySelector(
          `.choose-shade-section__image-nav-button--prev[data-product-index="${productIndex}"]`
        );
        const nextImageButton = productElement.querySelector(
          `.choose-shade-section__image-nav-button--next[data-product-index="${productIndex}"]`
        );

        if (prevImageButton && nextImageButton) {
          // Previous button with loop
          prevImageButton.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();

            const currentIndex = Array.from(slides).findIndex((slide) =>
              slide.classList.contains("is-selected")
            );

            if (currentIndex <= 0) {
              // Loop to last slide
              showSlide(slides.length - 1);
            } else {
              if (typeof imageCarousel.previous === "function") {
                imageCarousel.previous();
              } else {
                showSlide(currentIndex - 1);
              }
            }
          });

          // Next button with loop
          nextImageButton.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();

            const currentIndex = Array.from(slides).findIndex((slide) =>
              slide.classList.contains("is-selected")
            );

            if (currentIndex >= slides.length - 1) {
              // Loop to first slide
              showSlide(0);
            } else {
              if (typeof imageCarousel.next === "function") {
                imageCarousel.next();
              } else {
                showSlide(currentIndex + 1);
              }
            }
          });
        }
      }, 150);

      const formId = `choose-shade-form-${sectionId}-${productIndex}`;
      const form = document.getElementById(formId);
      if (form) {
        form.addEventListener("variant:change", function (event) {
          const variant = event.detail.variant;
          if (variant && variant.featured_media) {
            let mediaFound = false;
            slides.forEach((slide, i) => {
              const img = slide.querySelector("img");
              if (img) {
                const mediaId =
                  img.dataset.mediaId || img.getAttribute("data-media-id");
                if (mediaId == variant.featured_media.id) {
                  showSlide(i);
                  mediaFound = true;
                }
              }
            });
            // If no matching media found, show first slide
            if (!mediaFound && slides.length > 0) {
              showSlide(0);
            }
          } else {
            // If no variant media, show first slide
            if (slides.length > 0) {
              showSlide(0);
            }
          }
        });

        const variantInputs = form.querySelectorAll('input[type="radio"]');
        variantInputs.forEach((input) => {
          input.addEventListener("change", function () {
            if (this.dataset.variantMedia) {
              try {
                const variantMedia = JSON.parse(this.dataset.variantMedia);
                if (variantMedia && variantMedia.id) {
                  let mediaFound = false;
                  slides.forEach((slide, i) => {
                    const img = slide.querySelector("img");
                    if (img) {
                      const mediaId =
                        img.dataset.mediaId ||
                        img.getAttribute("data-media-id");
                      if (mediaId == variantMedia.id) {
                        showSlide(i);
                        mediaFound = true;
                      }
                    }
                  });
                  // If no matching media found, show first slide
                  if (!mediaFound && slides.length > 0) {
                    showSlide(0);
                  }
                }
              } catch (e) {
                console.error("Error parsing variant media:", e);
                // On error, show first slide
                if (slides.length > 0) {
                  showSlide(0);
                }
              }
            } else {
              // If no variant media data, show first slide
              if (slides.length > 0) {
                showSlide(0);
              }
            }
          });
        });
      }

      function isLightColor(hex) {
        if (!hex || !hex.startsWith("#")) return false;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.85;
      }

      function addSwatchLabels() {
        const optionsDataScript = form?.querySelector(
          "script[data-product-options]"
        );
        let productOptions = null;
        if (optionsDataScript) {
          try {
            productOptions = JSON.parse(optionsDataScript.textContent);
          } catch (e) {
            console.error("Error parsing product options:", e);
          }
        }

        const swatches = form?.querySelectorAll(".color-swatch");
        if (swatches) {
          swatches.forEach((swatch) => {
            const label = swatch.closest("label");
            if (label) {
              const existingLabel = label.querySelector(
                ".choose-shade-section__swatch-label"
              );
              if (existingLabel) {
                existingLabel.remove();
              }

              const input = label.querySelector('input[type="radio"]');
              let labelText = "";

              if (input && productOptions) {
                const optionPosition = parseInt(
                  input.getAttribute("data-option-position")
                );
                const optionValueId = input.value;

                const option = productOptions.options.find(
                  (opt) => opt.position === optionPosition
                );
                if (option) {
                  const value = option.values.find(
                    (val) => val.id.toString() === optionValueId.toString()
                  );
                  if (
                    value &&
                    value.name &&
                    !value.name.match(/^#[0-9A-Fa-f]{6}$/)
                  ) {
                    labelText = value.name;
                  }
                }
              }

              if (!labelText) {
                const tooltip = swatch.getAttribute("data-tooltip");
                if (tooltip && !tooltip.match(/^#[0-9A-Fa-f]{6}$/)) {
                  labelText = tooltip;
                }
              }

              if (!labelText) {
                const srOnly = label.querySelector(".sr-only");
                if (srOnly) {
                  const srText = srOnly.textContent.trim();
                  if (!srText.match(/^#[0-9A-Fa-f]{6}$/)) {
                    labelText = srText;
                  }
                }
              }

              const swatchStyle = swatch.getAttribute("style") || "";
              const hexMatch = swatchStyle.match(/#[0-9A-Fa-f]{6}/);
              if (hexMatch) {
                const hexColor = hexMatch[0];
                if (isLightColor(hexColor)) {
                  swatch.classList.add("needs-border");
                }
              } else if (
                labelText &&
                (labelText.toLowerCase().includes("white") ||
                  labelText === "#FFFFFF" ||
                  labelText === "#ffffff")
              ) {
                swatch.classList.add("needs-border");
              } else if (
                swatchStyle.includes("#FFFFFF") ||
                swatchStyle.includes("#ffffff") ||
                swatchStyle.includes("#fff")
              ) {
                swatch.classList.add("needs-border");
              }

              if (labelText && !labelText.match(/^#[0-9A-Fa-f]{6}$/)) {
                const labelElement = document.createElement("span");
                labelElement.className = "choose-shade-section__swatch-label";
                labelElement.textContent = labelText;
                label.appendChild(labelElement);
              }
            }
          });
        }
      }

      addSwatchLabels();

      if (form) {
        form.addEventListener("product:rerender", function () {
          setTimeout(addSwatchLabels, 100);
        });
      }
    });
  }

  function initAllChooseShadeSections() {
    const sections = document.querySelectorAll(
      ".shopify-section--choose-shade"
    );
    if (sections.length === 0) {
      return;
    }

    sections.forEach(function (section) {
      const sectionId = section.id.replace("shopify-section-", "");
      if (sectionId) {
        try {
          initChooseShade(sectionId);
        } catch (error) {
          console.error(
            "Choose Shade: Error initializing section",
            sectionId,
            error
          );
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAllChooseShadeSections);
  } else {
    initAllChooseShadeSections();
  }

  setTimeout(initAllChooseShadeSections, 500);
})();
