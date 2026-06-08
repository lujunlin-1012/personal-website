const root = document.documentElement;
const body = document.body;
const cursor = document.querySelector(".cursor-light");
const meter = document.querySelector(".scroll-meter");
const canvas = document.querySelector(".ambient-canvas");
const ctx = canvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let pointerX = window.innerWidth / 2;
let pointerY = window.innerHeight / 2;
let cursorX = pointerX;
let cursorY = pointerY;
let particles = [];

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.max(36, Math.floor(window.innerWidth / 26));
  particles = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: 1 + Math.random() * 2.6,
    speed: 0.18 + Math.random() * 0.42,
    phase: Math.random() * Math.PI * 2,
    hue: index % 3,
  }));
}

function drawAmbient(time = 0) {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles.forEach((particle) => {
    particle.y -= particle.speed;
    particle.x += Math.sin(time * 0.001 + particle.phase) * 0.22;

    if (particle.y < -10) {
      particle.y = window.innerHeight + 10;
      particle.x = Math.random() * window.innerWidth;
    }

    const palette = [
      "rgba(212, 75, 47, 0.34)",
      "rgba(31, 143, 134, 0.28)",
      "rgba(40, 74, 143, 0.28)",
    ];

    ctx.beginPath();
    ctx.fillStyle = palette[particle.hue];
    ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    ctx.fill();
  });

  if (!reduceMotion) {
    requestAnimationFrame(drawAmbient);
  }
}

function updateScrollMeter() {
  const max = root.scrollHeight - window.innerHeight;
  const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
  meter.style.width = `${progress}%`;
}

function animateCursor() {
  cursorX += (pointerX - cursorX) * 0.12;
  cursorY += (pointerY - cursorY) * 0.12;
  cursor.style.transform = `translate(${cursorX - 176}px, ${cursorY - 176}px)`;

  if (!reduceMotion) {
    requestAnimationFrame(animateCursor);
  }
}

function setupReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));
}

function setupTilt() {
  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (reduceMotion) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateX(${y * -7}deg) rotateY(${x * 9}deg) translateY(-4px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function setupMagnetic() {
  document.querySelectorAll(".magnetic").forEach((item) => {
    item.addEventListener("pointermove", (event) => {
      if (reduceMotion) return;
      const rect = item.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      item.style.transform = `translate(${x * 0.12}px, ${y * 0.18}px)`;
    });

    item.addEventListener("pointerleave", () => {
      item.style.transform = "";
    });
  });
}

function setupFilters() {
  const filters = document.querySelectorAll(".filter");
  const cards = document.querySelectorAll(".work-card");

  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      filters.forEach((button) => button.classList.remove("active"));
      filter.classList.add("active");

      const value = filter.dataset.filter;
      cards.forEach((card) => {
        const visible = value === "all" || card.dataset.category === value;
        card.classList.toggle("is-hidden", !visible);
      });
    });
  });
}

function setupMediaControls() {
  document.querySelectorAll(".work-media video").forEach((video) => {
    const button = video.parentElement.querySelector(".media-toggle");
    if (!button) return;

    button.addEventListener("click", async () => {
      if (video.paused) {
        await video.play();
        button.textContent = "暂停";
      } else {
        video.pause();
        button.textContent = "播放";
      }
    });
  });
}

document.addEventListener("pointermove", (event) => {
  pointerX = event.clientX;
  pointerY = event.clientY;
});

document.querySelector(".theme-toggle").addEventListener("click", () => {
  body.classList.toggle("dark");
});

window.addEventListener("scroll", updateScrollMeter, { passive: true });
window.addEventListener("resize", resizeCanvas);

resizeCanvas();
updateScrollMeter();
setupReveal();
setupTilt();
setupMagnetic();
setupFilters();
setupMediaControls();
drawAmbient();
animateCursor();
