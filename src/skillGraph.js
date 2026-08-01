// Placeholder self-rated levels (0-1) — edit before shipping this for real.
const SKILLS = [
  { label: 'WebGPU / TSL', level: 0.85 },
  { label: 'GSAP / Motion', level: 0.9 },
  { label: 'React / Next.js', level: 0.8 },
  { label: 'Shaders (GLSL)', level: 0.75 },
  { label: 'Design Systems', level: 0.7 },
  { label: 'Accessibility', level: 0.68 },
];

export function initSkillGraph(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let width = 0;
  let height = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width || 600;
    height = rect.height || 380;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const nodes = SKILLS.map((s, i) => {
    const angle = (i / SKILLS.length) * Math.PI * 2 - Math.PI / 2;
    const restDist = 90 + (1 - s.level) * 80;
    return {
      ...s,
      angle,
      restDist,
      r: 16 + s.level * 20,
      x: width / 2 + Math.cos(angle) * restDist,
      y: height / 2 + Math.sin(angle) * restDist,
      vx: 0,
      vy: 0,
      dragging: false,
    };
  });

  let dragTarget = null;

  function pointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  canvas.addEventListener('pointerdown', (e) => {
    const { x, y } = pointerPos(e);
    for (const n of nodes) {
      if (Math.hypot(n.x - x, n.y - y) < n.r + 6) {
        dragTarget = n;
        n.dragging = true;
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = 'grabbing';
        break;
      }
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragTarget) return;
    const { x, y } = pointerPos(e);
    dragTarget.x = x;
    dragTarget.y = y;
    dragTarget.vx = 0;
    dragTarget.vy = 0;
  });
  function release() {
    if (dragTarget) dragTarget.dragging = false;
    dragTarget = null;
    canvas.style.cursor = 'grab';
  }
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointerleave', release);

  function step() {
    const cx = width / 2;
    const cy = height / 2;

    for (const n of nodes) {
      if (n.dragging) continue;

      const tx = cx + Math.cos(n.angle) * n.restDist;
      const ty = cy + Math.sin(n.angle) * n.restDist;
      const springK = 0.02;
      n.vx += (tx - n.x) * springK;
      n.vy += (ty - n.y) * springK;

      for (const other of nodes) {
        if (other === n) continue;
        const dx = n.x - other.x;
        const dy = n.y - other.y;
        const dist = Math.max(Math.hypot(dx, dy), 1);
        const minDist = n.r + other.r + 24;
        if (dist < minDist) {
          const push = ((minDist - dist) / dist) * 0.06;
          n.vx += dx * push;
          n.vy += dy * push;
        }
      }

      n.vx *= 0.85;
      n.vy *= 0.85;
      n.x += n.vx;
      n.y += n.vy;
    }

    draw();
    requestAnimationFrame(step);
  }

  function wrapText(text, x, y, lineHeight) {
    const lines = text.split('\n');
    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, i) => ctx.fillText(line, x, startY + i * lineHeight));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const cx = width / 2;
    const cy = height / 2;

    ctx.strokeStyle = 'rgba(17,17,17,0.22)';
    ctx.lineWidth = 1;
    for (const n of nodes) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(n.x, n.y);
      ctx.stroke();
    }

    const hubR = 46;
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(cx, cy, hubR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f5f5f3';
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    wrapText('FRONTEND\nENGINEER', cx, cy, 13);

    for (const n of nodes) {
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#111111';
      ctx.font = '500 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(n.label, n.x, n.y + n.r + 8);
    }
  }

  requestAnimationFrame(step);
}
