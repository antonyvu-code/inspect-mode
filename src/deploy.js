function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function initDeployForm() {
  const form = document.getElementById('deploy-form');
  const status = document.querySelector('.deploy-status');
  if (!form || !status) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;

    const stages = ['Building', 'Deploying'];
    for (const stage of stages) {
      const t0 = performance.now();
      status.textContent = `${stage}...`;
      // eslint-disable-next-line no-await-in-loop
      await wait(550);
      const dt = performance.now() - t0;
      status.textContent = `${stage} — ${dt.toFixed(0)}ms`;
      // eslint-disable-next-line no-await-in-loop
      await wait(250);
    }

    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    const mailto = `mailto:YOUR-EMAIL@example.com?subject=${subject}&body=${body}`;

    status.innerHTML = `<span class="deploy-status__live">● LIVE</span> — this demo doesn't have a backend, so nothing was actually sent. <a href="${mailto}">Open your email client to really send it.</a>`;
    button.disabled = false;
  });
}
