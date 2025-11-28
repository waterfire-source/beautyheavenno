(function () {
  "use strict";

  if (!window.productCardQuickViewInitialized) {
    window.productCardQuickViewInitialized = true;

    document.addEventListener("click", (e) => {
      const quickViewBtn = e.target.closest(".product-card__quick-view-btn");
      if (quickViewBtn) {
        e.preventDefault();
        e.stopPropagation();

        const card = quickViewBtn.closest("product-card");
        const modalId = quickViewBtn.getAttribute("aria-controls");
        const modal = modalId
          ? document.getElementById(modalId)
          : card?.querySelector("quick-buy-modal");

        if (modal) {
          if (typeof modal.show === "function") {
            modal.show();
          } else {
            modal.setAttribute("open", "");
          }
          setTimeout(() => initJudgeMeInModal(modal), 300);
        }
        return;
      }

      const wishlistBtn = e.target.closest(".product-card__wishlist-btn");
      if (wishlistBtn) {
        e.preventDefault();
        e.stopPropagation();
        wishlistBtn.classList.toggle("active");
        return;
      }

      const addToCartBtn = e.target.closest("[data-quick-buy-trigger]");
      if (addToCartBtn) {
        e.preventDefault();
        e.stopPropagation();

        const modal = document.getElementById(
          addToCartBtn.dataset.quickBuyTrigger
        );
        if (modal) {
          typeof modal.show === "function"
            ? modal.show()
            : modal.setAttribute("open", "");

          setTimeout(() => initJudgeMeInModal(modal), 300);
        }
      }
    });

    function initJudgeMeInModal(modal) {
      const jm = window.judgeme || window.jdgm;
      if (!jm) return;

      const widgets = modal.querySelectorAll(".jdgm-widget, .jdgm-prev-badge");
      widgets.forEach((widget) => {
        try {
          if (typeof jm.loadWidgets === "function") jm.loadWidgets();
          if (typeof jm.initBadge === "function") jm.initBadge(widget);
          if (typeof jm.refreshBadge === "function") jm.refreshBadge(widget);
        } catch (e) {
          console.warn("Judge.me modal init error:", e);
        }
      });
    }

    document.addEventListener("modal:open", (e) => {
      const modal = e.target;
      if (modal) {
        setTimeout(() => initJudgeMeInModal(modal), 300);
      }
    });

    const modalObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (
              node.matches?.("quick-buy-modal") ||
              node.querySelector?.("quick-buy-modal")
            ) {
              setTimeout(() => {
                const modal = node.matches?.("quick-buy-modal")
                  ? node
                  : node.querySelector("quick-buy-modal");
                if (modal) initJudgeMeInModal(modal);
              }, 500);
            }

            if (node.closest?.(".quick-buy-modal, quick-buy-modal")) {
              const jm = window.judgeme || window.jdgm;
              if (jm && typeof jm.loadWidgets === "function") {
                setTimeout(() => jm.loadWidgets(), 100);
              }
            }
          }
        });
      });
    });

    modalObserver.observe(document.body, { childList: true, subtree: true });
  }

  if (window.judgeMeReviewsInitialized) return;
  window.judgeMeReviewsInitialized = true;

  function debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function hasValidContent(widget) {
    return (
      widget.innerHTML.trim().length > 0 ||
      widget.querySelector(
        ".jdgm-prev-badge__stars, .jdgm-prev-badge__text, .jdgm-star"
      )
    );
  }

  function hasValidRating(widget) {
    const hasStars = widget.querySelector(".jdgm-star.jdgm--on");
    const ratingText =
      widget.querySelector(".jdgm-prev-badge__text")?.textContent?.trim() || "";
    const hasReviewCount =
      /\d+/.test(ratingText) && !ratingText.toLowerCase().includes("no review");
    return hasStars || hasReviewCount;
  }

  function showRatingWrapper(widget) {
    const wrapper = widget.closest(".product-card__rating-wrapper");
    if (wrapper) {
      wrapper.style.display = "";
      wrapper.style.opacity = "1";
      wrapper.style.visibility = "visible";
    }
  }

  function hideRatingWrapper(widget, showNativeFallback = true) {
    const wrapper = widget.closest(".product-card__rating-wrapper");
    if (!wrapper) return;

    const productRating = wrapper.querySelector(".product-rating");
    const nativeRating = productRating?.querySelector("[data-native-rating]");

    if (showNativeFallback && nativeRating) {
      nativeRating.style.display = "";
      widget.style.display = "none";
    } else {
      const showIfEmpty = wrapper.dataset.showEmpty === "true";
      if (!showIfEmpty) {
        wrapper.style.display = "none";
      }
    }
  }

  function initJudgeMeAPI(widget) {
    const jm = window.judgeme || window.jdgm;
    if (!jm) return false;

    try {
      if (typeof jm.loadWidgets === "function") jm.loadWidgets();
      if (typeof jm.initBadge === "function") jm.initBadge(widget);
      if (typeof jm.refreshBadge === "function") jm.refreshBadge(widget);
      if (typeof jm.renderBadge === "function") jm.renderBadge(widget);

      document.dispatchEvent(
        new CustomEvent("judgeme:init-badge", {
          detail: { widget, productId: widget.dataset.id },
        })
      );

      return true;
    } catch (e) {
      console.warn("Judge.me initialization error:", e);
      return false;
    }
  }

  function processWidget(widget) {
    const productId = widget.dataset.id;
    if (!productId) return;

    if (widget.dataset.initialized === "success" && hasValidContent(widget)) {
      if (hasValidRating(widget)) {
        showRatingWrapper(widget);
      }
      return;
    }

    const jm = window.judgeme || window.jdgm;
    if (!jm) {
      widget.dataset.initialized = "pending";
      return;
    }

    widget.dataset.initialized = "attempted";

    if (!initJudgeMeAPI(widget)) {
      widget.dataset.initialized = "error";
      return;
    }

    const checkValidRating = (attempt = 1) => {
      if (hasValidContent(widget) && hasValidRating(widget)) {
        widget.dataset.initialized = "success";
        showRatingWrapper(widget);
        return;
      }

      if (attempt < 5) {
        setTimeout(() => checkValidRating(attempt + 1), 500 * attempt);
      } else {
        if (!hasValidRating(widget)) {
          hideRatingWrapper(widget, true);
        }
      }
    };

    setTimeout(() => checkValidRating(1), 300);
  }

  function initializeJudgeMeWidgets() {
    document
      .querySelectorAll(
        ".product-card .jdgm-prev-badge, .product-card .jdgm-widget"
      )
      .forEach(processWidget);
  }

  const debouncedInit = debounce(initializeJudgeMeWidgets, 100);

  initializeJudgeMeWidgets();

  [300, 1000, 2000, 4000].forEach((delay) =>
    setTimeout(initializeJudgeMeWidgets, delay)
  );

  const jm = window.judgeme || window.jdgm;
  if (!jm) {
    let attempts = 0;
    const maxAttempts = 200;

    const checkJudgeMe = setInterval(() => {
      attempts++;
      const jmLoaded = window.judgeme || window.jdgm;

      if (jmLoaded || attempts >= maxAttempts) {
        clearInterval(checkJudgeMe);
        if (jmLoaded) {
          initializeJudgeMeWidgets();
          setTimeout(initializeJudgeMeWidgets, 500);
          setTimeout(initializeJudgeMeWidgets, 1500);
        }
      }
    }, 100);
  }

  const observer = new MutationObserver((mutations) => {
    let shouldInit = false;

    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== 1) continue;

        if (
          node.classList?.contains("product-card") ||
          node.querySelector?.(".product-card")
        ) {
          shouldInit = true;
          break;
        }

        if (
          node.classList?.contains("jdgm-prev-badge") ||
          node.classList?.contains("jdgm-widget") ||
          node.querySelector?.(".jdgm-prev-badge, .jdgm-widget")
        ) {
          shouldInit = true;
          break;
        }

        if (node.tagName === "SCRIPT" && node.src?.includes("judge")) {
          shouldInit = true;
          break;
        }
      }

      if (
        mutation.type === "attributes" &&
        mutation.target.classList?.contains("jdgm-prev-badge")
      ) {
        shouldInit = true;
        break;
      }

      if (shouldInit) break;
    }

    if (shouldInit) debouncedInit();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "data-average-rating", "data-number-of-reviews"],
  });

  [
    "judgeme:widgets-loaded",
    "judgeme:badge-loaded",
    "judgeme:loaded",
    "jdgm:loaded",
  ].forEach((event) => {
    document.addEventListener(event, () => {
      debouncedInit();
      setTimeout(initializeJudgeMeWidgets, 500);
    });
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(initializeJudgeMeWidgets, 100);
    });
  }

  window.addEventListener("load", () => {
    setTimeout(initializeJudgeMeWidgets, 500);
    setTimeout(initializeJudgeMeWidgets, 2000);
  });

  const jmInstance = window.judgeme || window.jdgm;
  if (jmInstance?.ready) {
    jmInstance.ready(initializeJudgeMeWidgets);
  }
})();
