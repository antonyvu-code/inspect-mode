import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

const html = document.documentElement;

const hud = {
  components: document.querySelector('[data-hud="components"]'),
  compile: document.querySelector('[data-hud="compile"]'),
  fps: document.querySelector('[data-hud="fps"]'),
};

function reduceMotion() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function updateComponentCount() {
  const n = document.querySelectorAll('[data-component]').length;
  if (hud.components) hud.components.textContent = `${n} components`;
}

function setCompileTime(ms) {
  if (hud.compile) hud.compile.textContent = `${ms.toFixed(1)} ms compile`;
}

export function toggleInspect() {
  const turningOn = html.dataset.inspect !== 'on';
  const targets = document.querySelectorAll('.flip-target');
  const state = Flip.getState(targets);
  const t0 = performance.now();

  html.dataset.inspect = turningOn ? 'on' : 'off';

  document.querySelectorAll('[data-inspect-trigger]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(turningOn));
  });

  Flip.from(state, {
    duration: reduceMotion() ? 0 : 0.7,
    ease: 'power3.inOut',
    stagger: reduceMotion() ? 0 : 0.015,
    absolute: true,
    onComplete() {
      setCompileTime(performance.now() - t0);
    },
  });

  updateComponentCount();
}

export function initInspectToggle() {
  updateComponentCount();
  document.querySelectorAll('[data-inspect-trigger]').forEach((btn) => {
    btn.addEventListener('click', toggleInspect);
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === '`' && !e.repeat) {
      e.preventDefault();
      toggleInspect();
    }
  });
}

export function initGridToggle() {
  const btn = document.querySelector('[data-grid-trigger]');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const on = document.body.classList.toggle('show-grid');
    btn.setAttribute('aria-pressed', String(on));
  });
}

export function initFPSMeter() {
  let last = performance.now();
  let frames = 0;
  function tick(now) {
    frames += 1;
    if (now - last >= 500) {
      const fps = Math.round((frames * 1000) / (now - last));
      if (hud.fps) hud.fps.textContent = `${fps} fps`;
      frames = 0;
      last = now;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

export function initBoundingBoxOverlay() {
  const box = document.createElement('div');
  box.className = 'inspect-box';
  box.style.display = 'none';
  const label = document.createElement('span');
  label.className = 'inspect-box__label';
  box.appendChild(label);
  document.body.appendChild(box);

  function describe(el) {
    const name = el.dataset.component;
    let props = {};
    try {
      props = JSON.parse(el.dataset.props || '{}');
    } catch {
      props = {};
    }
    const propsStr = Object.entries(props)
      .map(([k, v]) => (Array.isArray(v) ? `${k}: ${v.join(', ')}` : `${k}: ${v}`))
      .join(' · ');
    return propsStr ? `<${name}> ${propsStr}` : `<${name}>`;
  }

  function show(el) {
    if (html.dataset.inspect !== 'on') return;
    const rect = el.getBoundingClientRect();
    label.textContent = describe(el);
    box.style.display = 'block';
    box.style.left = `${rect.left}px`;
    box.style.top = `${rect.top}px`;
    box.style.width = `${rect.width}px`;
    box.style.height = `${rect.height}px`;
  }

  function hide() {
    box.style.display = 'none';
  }

  document.addEventListener('pointerover', (e) => {
    const el = e.target.closest('[data-component]');
    if (el) show(el);
  });
  document.addEventListener('pointerout', (e) => {
    const el = e.target.closest('[data-component]');
    if (el && !el.contains(e.relatedTarget)) hide();
  });
  document.addEventListener('focusin', (e) => {
    const el = e.target.closest('[data-component]');
    if (el) show(el);
  });
  document.addEventListener('focusout', (e) => {
    const el = e.target.closest('[data-component]');
    if (el) hide();
  });
  window.addEventListener('scroll', hide, { passive: true });
}
