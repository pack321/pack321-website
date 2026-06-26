(function () {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("#primary-nav");

  if (!header || !toggle || !nav) return;

  toggle.addEventListener("click", function () {
    const isOpen = header.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) {
      header.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
})();
