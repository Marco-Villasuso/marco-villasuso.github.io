// Page interactions: nav state, mobile menu, scroll reveal, image placeholders, lightbox.
(() => {
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelectorAll(".nav-links a");

  document.getElementById("year").textContent = new Date().getFullYear();

  // Solid nav background once you scroll past the top
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 20);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  links.forEach((a) => a.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }));

  // Fade sections in as they enter the viewport
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));

  // GPA number counts up alongside the scale bar fill (bar itself is CSS)
  const gpa = document.querySelector(".gpa-value");
  if (gpa && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const target = parseFloat(gpa.dataset.gpa);
    gpa.textContent = "0.00";
    new IntersectionObserver(([e], obs) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now() + 200, dur = 1400;
      const tick = (now) => {
        const t = Math.min(1, Math.max(0, (now - start) / dur));
        const eased = 1 - Math.pow(1 - t, 3);
        gpa.textContent = (target * eased).toFixed(2);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 }).observe(gpa);
  }

  // Highlight the nav link for the section currently on screen
  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${e.target.id}`));
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("section[id]").forEach((s) => sectionObs.observe(s));

  // Missing images become a placeholder that shows the expected file path
  document.querySelectorAll(".gallery img").forEach((img) => {
    const swap = () => {
      const ph = document.createElement("div");
      ph.className = "img-placeholder";
      ph.textContent = img.getAttribute("src");
      img.replaceWith(ph);
    };
    if (img.complete && img.naturalWidth === 0) swap();
    else img.addEventListener("error", swap);
  });

  // Click-to-enlarge lightbox
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.innerHTML = "<img alt='' />";
  document.body.appendChild(lightbox);
  const lbImg = lightbox.querySelector("img");

  document.addEventListener("click", (e) => {
    const img = e.target.closest(".gallery img");
    if (!img) return;
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lightbox.classList.add("open");
  });
  lightbox.addEventListener("click", () => lightbox.classList.remove("open"));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") lightbox.classList.remove("open"); });
})();
