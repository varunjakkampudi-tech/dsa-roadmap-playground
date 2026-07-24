/**
 * confetti — tiny dependency-free celebration burst.
 * Draws colored particles on a transient full-screen canvas, then cleans up.
 * Usage: DSA.confetti();
 */
window.DSA = window.DSA || {};

DSA.confetti = function confetti(count = 90) {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  const colors = ["#06b6d4", "#22d3ee", "#0891b2", "#f59e0b", "#7ee787", "#ff6b74", "#a78bfa"];
  const originX = canvas.width / 2;
  const particles = Array.from({ length: count }, () => ({
    x: originX + (Math.random() - 0.5) * 120,
    y: canvas.height * 0.34,
    vx: (Math.random() - 0.5) * 11,
    vy: Math.random() * -11 - 4,
    size: Math.random() * 7 + 4,
    color: colors[(Math.random() * colors.length) | 0],
    rot: Math.random() * Math.PI,
    vrot: (Math.random() - 0.5) * 0.3,
    life: 1,
  }));

  const gravity = 0.32;
  let raf;
  const start = performance.now();

  function frame(now) {
    const elapsed = now - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.vy += gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      p.life = Math.max(0, 1 - elapsed / 1700);
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });
    if (elapsed < 1700) {
      raf = requestAnimationFrame(frame);
    } else {
      cancelAnimationFrame(raf);
      canvas.remove();
    }
  }
  raf = requestAnimationFrame(frame);
};
