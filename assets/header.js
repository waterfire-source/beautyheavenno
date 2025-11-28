document.documentElement.style.setProperty(
  "--header-height",
  `${document
    .getElementById("shopify-section-{{ section.id }}")
    .clientHeight.toFixed(2)}px`
);

(function () {
  const mobileMenuToggle = document.getElementById(
    "mobile-menu-toggle-{{ section.id }}"
  );
  const sidebarMenu = document.getElementById("sidebar-menu");

  if (mobileMenuToggle && sidebarMenu) {
    mobileMenuToggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const isOpen =
        sidebarMenu.hasAttribute("open") || sidebarMenu.open === true;

      if (isOpen) {
        if (typeof sidebarMenu.close === "function") {
          sidebarMenu.close();
        } else {
          sidebarMenu.removeAttribute("open");
        }
      } else {
        if (typeof sidebarMenu.show === "function") {
          sidebarMenu.show();
        } else {
          sidebarMenu.setAttribute("open", "");
        }
      }
    });
  }
})();
