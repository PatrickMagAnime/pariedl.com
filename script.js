const root = document.documentElement;
const ripples = [];
const revealElements = document.querySelectorAll('.reveal');
const placeholderImages = document.querySelectorAll('.image-placeholder-media');

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
