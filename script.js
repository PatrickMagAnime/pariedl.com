const root = document.documentElement;
const ripples = [];
const revealElements = document.querySelectorAll('.reveal');
const placeholderImages = document.querySelectorAll('.image-placeholder-media');
const serviceRows = document.querySelectorAll('[data-service-url]');

function setStatus(statusElement, state, text) {
  const statusText = statusElement?.querySelector('.status-text');

  if (!statusElement || !statusText) {
    return;
  }

  statusElement.classList.remove('is-loading', 'is-online', 'is-offline');
  statusElement.classList.add(`is-${state}`);
  statusText.textContent = text;
}

function updatePointer(event) {
  root.style.setProperty("--pointer-x", `${event.clientX}px`);
  root.style.setProperty("--pointer-y", `${event.clientY}px`);
}

function createRipple(event) {
  const ripple = document.createElement("span");
  ripple.className = "click-ripple";
  ripple.style.left = `${event.clientX}px`;
  ripple.style.top = `${event.clientY}px`;
  document.body.appendChild(ripple);
  ripples.push(ripple);

  window.setTimeout(() => {
    ripple.remove();
    const index = ripples.indexOf(ripple);
    if (index !== -1) {
      ripples.splice(index, 1);
    }
  }, 620);
}

document.addEventListener("pointermove", updatePointer, { passive: true });
document.addEventListener("pointerdown", createRipple, { passive: true });

async function checkServiceStatus(row) {
  const statusElement = row.querySelector('[data-status]');

  if (!statusElement) {
    return;
  }

  setStatus(statusElement, 'loading', 'Prüfe…');

  try {
    const siteMarker = 'pariedl-home-2026-07-13';
    const serviceUrl = row.dataset.serviceUrl;
    const response = await fetch(serviceUrl, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });

    const body = await response.text();
    const hasMarker = body.includes(siteMarker);
    const isProxyManagerDefault = /Congratulations!|Nginx Proxy Manager|host that isn\'t set up yet|Admin panel/i.test(body);

    if (response.ok && hasMarker && !isProxyManagerDefault) {
      setStatus(statusElement, 'online', 'Live');
      return;
    }

    setStatus(statusElement, 'offline', 'Offline');
  } catch {
    setStatus(statusElement, 'offline', 'Offline');
  }
}

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }
  },
  {
    threshold: 0.14,
    rootMargin: '0px 0px -8% 0px',
  }
);

for (const element of revealElements) {
  observer.observe(element);
}

for (const row of serviceRows) {
  checkServiceStatus(row);
}

for (const image of placeholderImages) {
  image.addEventListener('error', () => {
    image.classList.add('is-missing');
  });
}

for (const link of document.querySelectorAll("a")) {
  link.addEventListener("click", (event) => {
    event.currentTarget.blur();
  });
}
