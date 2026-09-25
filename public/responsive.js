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
  const topbar = root.querySelector(".topbar");

  function updateStickyHeader() {
    const stickyPoint = topbar?.offsetHeight ?? 0;
    header.classList.toggle("is-stuck", window.scrollY > stickyPoint);
  }

  updateStickyHeader();
  window.addEventListener("scroll", updateStickyHeader, { passive: true });

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

(() => {
  const forms = document.querySelectorAll("form.estimate-form");
  if (!forms.length) return;

  forms.forEach((form) => {
    form.dataset.formStartedAt = String(Date.now());

    const honeypot = document.createElement("label");
    honeypot.className = "form-honeypot";
    honeypot.setAttribute("aria-hidden", "true");
    honeypot.innerHTML = '<span>Website</span><input name="website" type="text" tabindex="-1" autocomplete="off">';
    form.append(honeypot);

    const existingNote = form.querySelector(".form-note");
    if (existingNote) {
      existingNote.textContent = "Your information is sent securely to the Citrus Demolition team.";
    }

    const status = document.createElement("p");
    status.className = "form-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    form.append(status);
  });

  document.addEventListener(
    "submit",
    async (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || !form.matches(".estimate-form")) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      if (!form.reportValidity()) return;

      const submitButton = form.querySelector('button[type="submit"]');
      const status = form.querySelector(".form-status");
      if (!(submitButton instanceof HTMLButtonElement) || !(status instanceof HTMLElement)) return;
      if (submitButton.disabled) return;

      const originalButtonHtml = submitButton.innerHTML;
      submitButton.disabled = true;
      submitButton.textContent = "Sending request...";
      status.className = "form-status";
      status.textContent = "";

      const data = Object.fromEntries(new FormData(form).entries());
      data.sourcePage = window.location.href;
      data.submittedAt = form.dataset.formStartedAt || "";

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(result.error || "We could not send your request. Please call 352-464-5955.");
        }

        form.reset();
        status.className = "form-status is-success";
        status.textContent = "Thank you. Your estimate request was sent successfully.";
        submitButton.textContent = "Request received";

        if (typeof window.gtag === "function") {
          window.gtag("event", "generate_lead", { form_name: "free_estimate" });
        }
      } catch (error) {
        status.className = "form-status is-error";
        status.textContent = error instanceof Error
          ? error.message
          : "We could not send your request. Please call 352-464-5955.";
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonHtml;
        form.dataset.formStartedAt = String(Date.now());
      }
    },
    true,
  );
})();
