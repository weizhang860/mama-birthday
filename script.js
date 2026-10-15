const opening = document.querySelector('#opening');
const album = document.querySelector('#album');
const startButton = document.querySelector('#startButton');
const backButton = document.querySelector('#backButton');
const track = document.querySelector('#photoTrack');
const slides = [...document.querySelectorAll('.photo-slide')];
const currentCount = document.querySelector('#currentCount');
const progressBar = document.querySelector('#progressBar');
const previousButton = document.querySelector('#previousButton');
const nextButton = document.querySelector('#nextButton');

let current = 0;

function setCurrent(index) {
  current = Math.max(0, Math.min(index, slides.length - 1));
  slides.forEach((slide, slideIndex) => slide.classList.toggle('active', slideIndex === current));
  currentCount.textContent = String(current + 1).padStart(2, '0');
  progressBar.style.width = `${((current + 1) / slides.length) * 100}%`;
}

function goTo(index) {
  setCurrent(index);
  const slide = slides[current];
  const left = slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2;
  track.scrollTo({ left, behavior: 'smooth' });
}

startButton.addEventListener('click', () => {
  opening.hidden = true;
  album.hidden = false;
  setCurrent(0);
  window.scrollTo({ top: 0 });
  track.focus({ preventScroll: true });
});

backButton.addEventListener('click', () => {
  album.hidden = true;
  opening.hidden = false;
  window.scrollTo({ top: 0 });
  startButton.focus({ preventScroll: true });
});

previousButton.addEventListener('click', () => goTo(current - 1));
nextButton.addEventListener('click', () => goTo(current + 1));

// Native horizontal scrolling works on touch devices. This small fallback also
// turns a clear finger swipe into a slide change on browsers with finicky
// scroll-snap handling, without blocking normal scrolling.
let touchStartX = null;
track.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'touch') touchStartX = event.clientX;
});

track.addEventListener('pointerup', (event) => {
  if (touchStartX === null || event.pointerType !== 'touch') return;
  const distance = event.clientX - touchStartX;
  touchStartX = null;
  if (Math.abs(distance) < 45) return;
  goTo(current + (distance < 0 ? 1 : -1));
});

track.addEventListener('pointercancel', () => { touchStartX = null; });

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setCurrent(Number(visible.target.dataset.index));
  },
  { root: track, threshold: [0.55, 0.7] },
);

slides.forEach((slide) => observer.observe(slide));

track.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(current - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); goTo(current + 1); }
});

setCurrent(0);

