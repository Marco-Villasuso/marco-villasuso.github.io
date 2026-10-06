// Animated starfield: twinkling stars in 3 depth layers that parallax with
// scroll and mouse movement, plus the occasional shooting star.
(() => {
  const canvas = document.getElementById("starfield");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // depth: how much the layer moves with scroll (far stars move less)
  const LAYERS = [
    { density: 0.00018, size: [0.4, 0.9], depth: 0.05 },
    { density: 0.00008, size: [0.8, 1.4], depth: 0.15 },
    { density: 0.00003, size: [1.3, 2.0], depth: 0.3 },
  ];
  const STAR_COLORS = ["255,255,255", "200,215,255", "255,236,210", "170,195,255"];

  let w, h, dpr, stars = [], shooting = [];
  let scrollY = window.scrollY;
  let mouseX = 0, mouseY = 0, targetMX = 0, targetMY = 0;

  const rand = (a, b) => a + Math.random() * (b - a);

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
  }

  function buildStars() {
    stars = [];
    LAYERS.forEach((layer) => {
      const count = Math.round(w * h * layer.density);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: rand(layer.size[0], layer.size[1]),
          depth: layer.depth,
          base: rand(0.4, 1),
          speed: rand(0.5, 2),
          phase: Math.random() * Math.PI * 2,
          color: STAR_COLORS[(Math.random() * STAR_COLORS.length) | 0],
        });
      }
    });
  }

  function spawnShootingStar() {
    const angle = rand(Math.PI * 0.15, Math.PI * 0.3);
    shooting.push({
      x: rand(0, w * 0.8),
      y: rand(0, h * 0.4),
      vx: Math.cos(angle) * rand(9, 14),
      vy: Math.sin(angle) * rand(9, 14),
      life: 0,
      maxLife: rand(40, 70),
    });
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);

    // ease mouse parallax
    mouseX += (targetMX - mouseX) * 0.05;
    mouseY += (targetMY - mouseY) * 0.05;

    for (const s of stars) {
      // wrap vertically so scrolling never runs out of stars
      let y = (s.y - scrollY * s.depth + mouseY * s.depth * 40) % h;
      if (y < 0) y += h;
      let x = (s.x + mouseX * s.depth * 40) % w;
      if (x < 0) x += w;

      const twinkle = reduceMotion ? 1 : 0.6 + 0.4 * Math.sin(t * 0.001 * s.speed + s.phase);
      const alpha = s.base * twinkle;

      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.color},${alpha})`;
      ctx.fill();

      // soft glow on the bigger, nearer stars
      if (s.r > 1.4) {
        ctx.beginPath();
        ctx.arc(x, y, s.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color},${alpha * 0.08})`;
        ctx.fill();
      }
    }

    // shooting stars
    if (!reduceMotion && Math.random() < 0.004) spawnShootingStar();
    shooting = shooting.filter((s) => s.life < s.maxLife);
    for (const s of shooting) {
      s.life++;
      s.x += s.vx;
      s.y += s.vy;
      // solid streak: a bright head and a fainter tail, each one flat color
      const fade = 1 - s.life / s.maxLife;
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = `rgba(255,255,255,${fade * 0.35})`;
      ctx.beginPath();
      ctx.moveTo(s.x - s.vx * 3, s.y - s.vy * 3);
      ctx.lineTo(s.x - s.vx * 8, s.y - s.vy * 8);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255,255,255,${fade})`;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 3, s.y - s.vy * 3);
      ctx.stroke();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });
  window.addEventListener("mousemove", (e) => {
    targetMX = e.clientX / w - 0.5;
    targetMY = e.clientY / h - 0.5;
  });

  resize();
  requestAnimationFrame(draw);
})();
