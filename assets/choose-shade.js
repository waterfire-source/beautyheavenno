(function () {
  "use strict";

  function initChooseShade(sectionId) {
    const section = document.getElementById(`shopify-section-${sectionId}`);
    if (!section) return;

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
        }
      }

      const formId = `choose-shade-form-${sectionId}-${productIndex}`;
      const form = document.getElementById(formId);
      if (form) {
        form.addEventListener("variant:change", function (event) {
          const variant = event.detail.variant;
          if (variant && variant.featured_media) {
            slides.forEach((slide, i) => {
              const img = slide.querySelector("img");
              if (img) {
                const mediaId =
                  img.dataset.mediaId || img.getAttribute("data-media-id");
                if (mediaId == variant.featured_media.id) {
                  showSlide(i);
                }
              }
            });
          }
        });

        const variantInputs = form.querySelectorAll('input[type="radio"]');
        variantInputs.forEach((input) => {
          input.addEventListener("change", function () {
            if (this.dataset.variantMedia) {
              try {
                const variantMedia = JSON.parse(this.dataset.variantMedia);
                if (variantMedia && variantMedia.id) {
                  slides.forEach((slide, i) => {
                    const img = slide.querySelector("img");
                    if (img) {
                      const mediaId =
                        img.dataset.mediaId ||
                        img.getAttribute("data-media-id");
                      if (mediaId == variantMedia.id) {
                        showSlide(i);
                      }
                    }
                  });
                }
              } catch (e) {
                console.error("Error parsing variant media:", e);
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
