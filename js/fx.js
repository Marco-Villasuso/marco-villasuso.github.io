// Tag particle effects. Add data-fx="flame" or data-fx="frost" to any element.
//   flame: rocket exhaust out of the element's right side (flame only, no smoke)
//   frost: cryogenic condensation spilling off the element, plus ice glints
// Every particle is a single solid color; nothing uses gradients.
(() => {
  const els = document.querySelectorAll("[data-fx]");
  if (!els.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const rand = (a, b) => a + Math.random() * (b - a);

  // Flame colors from the nozzle outward: hot core → yellow → orange → red tip
  const FLAME = ["#fff4c4", "#ffd23f", "#ffa424", "#ff6a1a", "#e23b16"];

  const EFFECTS = {
    flame: {
      spawn(fx) {
        for (let i = 0; i < 5; i++) {
          fx.particles.push({
            x: rand(0, 2),
            y: fx.h / 2 + rand(-3, 3),
            vx: rand(2.2, 3.8),
            vy: rand(-0.25, 0.25),
            r: rand(3.5, 5.5),
            life: 0,
            max: rand(16, 28),
          });
        }
      },
      draw(ctx, p) {
        const t = p.life / p.max;
        ctx.globalAlpha = 1 - t * 0.6;
        ctx.fillStyle = FLAME[Math.min(FLAME.length - 1, (t * FLAME.length) | 0)];
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.3, p.r * (1 - t * 0.85)), 0, Math.PI * 2);
        ctx.fill();
      },
      step(p) {
        p.x += p.vx;
        p.y += p.vy + Math.sin(p.life * 0.9) * 0.15; // slight flicker
        p.vx *= 0.985;
      },
    },

    frost: {
      spawn(fx) {
        // Cold vapor rolls off the bottom edge and sinks, the way LN2/LOX condensation does
        if (Math.random() < 0.55) {
          fx.particles.push({
            kind: "vapor",
            x: rand(fx.padX, fx.w - fx.padX),
            y: fx.padTop + fx.elH - 2,
            vx: rand(-0.18, 0.18),
            vy: rand(0.12, 0.4),
            r: rand(1.5, 3),
            grow: rand(0.05, 0.11),
            life: 0,
            max: rand(70, 120),
          });
        }
        // Occasional ice glint along the tag's border
        if (Math.random() < 0.08) {
          const onTop = Math.random() < 0.5;
          fx.particles.push({
            kind: "glint",
            x: rand(fx.padX, fx.w - fx.padX),
            y: onTop ? fx.padTop : fx.padTop + fx.elH,
            life: 0,
            max: rand(18, 30),
          });
        }
      },
      draw(ctx, p) {
        const t = p.life / p.max;
        if (p.kind === "vapor") {
          ctx.globalAlpha = 0.32 * (1 - t);
          ctx.fillStyle = "#e6f4fa";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // four-point sparkle
          const s = 2.5 * Math.sin(t * Math.PI);
          ctx.globalAlpha = 1;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(p.x - s, p.y - 0.5, s * 2, 1);
          ctx.fillRect(p.x - 0.5, p.y - s, 1, s * 2);
        }
      },
      step(p) {
        if (p.kind !== "vapor") return;
        p.x += p.vx + Math.sin((p.life + p.x) * 0.05) * 0.1; // lazy drift
        p.y += p.vy;
        p.r += p.grow;
      },
    },
  };

  const active = [];

  els.forEach((el) => {
    const type = el.dataset.fx;
    if (!EFFECTS[type]) return;
    const canvas = document.createElement("canvas");
    canvas.className = `fx-canvas fx-${type}`;
    canvas.setAttribute("aria-hidden", "true");
    el.appendChild(canvas);

    const fx = { el, type, canvas, ctx: canvas.getContext("2d"), particles: [], visible: false };
    active.push(fx);

    new IntersectionObserver(([e]) => { fx.visible = e.isIntersecting; }).observe(el);
  });

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    active.forEach((fx) => {
      const r = fx.canvas.getBoundingClientRect();
      fx.w = r.width;
      fx.h = r.height;
      fx.canvas.width = r.width * dpr;
      fx.canvas.height = r.height * dpr;
      fx.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // where the tag itself sits inside the frost canvas (matches .fx-frost offsets in CSS)
      fx.padX = 18;
      fx.padTop = 8;
      fx.elH = fx.el.offsetHeight;
    });
  }

  function loop() {
    for (const fx of active) {
      if (!fx.visible) continue;
      const effect = EFFECTS[fx.type];
      effect.spawn(fx);
      fx.ctx.clearRect(0, 0, fx.w, fx.h);
      fx.particles = fx.particles.filter((p) => ++p.life < p.max);
      for (const p of fx.particles) {
        effect.step(p);
        effect.draw(fx.ctx, p);
      }
      fx.ctx.globalAlpha = 1;
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", size);
  window.addEventListener("load", size); // re-measure once web fonts settle
  size();
  requestAnimationFrame(loop);
})();
