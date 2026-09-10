(() => {
  const root = document.querySelector("#citrus-demolition-services-redesign");
  const header = root?.querySelector(".site-header");
  const menu = root?.querySelector("#mobile-menu");

  if (!root || !header || !menu) return;

  const toggle = document.createElement("button");
  toggle.className = "mobile-menu-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-controls", "mobile-menu");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Open menu");
  toggle.innerHTML = '<span class="mobile-menu-toggle-lines" aria-hidden="true"></span>';
  header.append(toggle);

  const closeButton = menu.querySelector(".mobile-menu-close");

  function setMenuOpen(open) {
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("citrus-menu-lock", open);

    if (open) closeButton?.focus();
    else toggle.focus();
  }

  toggle.addEventListener("click", () => setMenuOpen(menu.hidden));
  closeButton?.addEventListener("click", () => setMenuOpen(false));
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) setMenuOpen(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980 && !menu.hidden) setMenuOpen(false);
  });
})();
