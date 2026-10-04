// ---- Edit these -------------------------------------------------------
// Profile links used by the contact buttons and as the fallback for any
// release that has no link of its own.
const LINKS = {
  spotify: 'https://open.spotify.com/artist/0BaPCHvfHaThF8nhfvEAzF',
  apple: 'https://music.apple.com/us/artist/kostandino/1568477597',
  soundcloud: 'https://soundcloud.com/kosta_sweezy',
  instagram: 'https://www.instagram.com/kostandno/',
};

// One entry per release, newest first. Each release only shows buttons for
// the services listed in its `links`, so every button goes straight to that song.
const APPLE = 'https://music.apple.com/us/album/';
const SPOTIFY = 'https://open.spotify.com/track/';
// TODO: Planet, Aurora and Demo My Heart use a Spotify search until Kosta sends their direct links.
const SPOTIFY_SEARCH = 'https://open.spotify.com/search/';
const RELEASES = [
  { title: 'Willow', note: 'single · 2026', img: 'willow.jpg',
    links: { spotify: SPOTIFY + '4Q93FwXEhfIGorU4pDBz6H', apple: APPLE + 'willow-single/6794258295' } },
  { title: 'Way Back', note: 'single · 2025', img: 'way-back.jpg',
    links: { spotify: SPOTIFY + '5uOQFMkOszuv7YzCdc0JRe', apple: APPLE + 'way-back-single/1797192500' } },
  { title: 'Showing Off', note: 'single · 2024', img: 'showing-off.jpg',
    links: { spotify: SPOTIFY + '5baDKmhhPVbR0tg2s16eMX', apple: APPLE + 'showing-off-single/1778623211' } },
  { title: 'Picky', note: 'single · 2023', img: 'picky.jpg',
    links: { spotify: SPOTIFY + '5NpYhIiYcllEQnmgrbIWVt', apple: APPLE + 'picky-single/1717760333' } },
  { title: 'Bella’s Ranger', note: 'single · 2023', img: 'bellas-ranger.jpg',
    links: { spotify: SPOTIFY + '5KoyYJvoPQU63aAPzqw44L', apple: APPLE + 'bellas-ranger-single/1675474994' } },
  { title: 'Planet', note: 'single · 2022', img: 'planet.jpg',
    links: { spotify: SPOTIFY_SEARCH + 'Kostandino%20Planet', apple: APPLE + 'planet-single/1644307799' } },
  { title: 'Aurora', note: 'album · 9 songs · 2022', img: 'aurora.jpg',
    links: { spotify: SPOTIFY_SEARCH + 'Kostandino%20Aurora', apple: APPLE + 'aurora/1619951307' } },
  { title: '2 Years', note: 'single · 2021', img: '2-years.jpg',
    links: { spotify: SPOTIFY + '1d84yhOE6MAA1qA1ucngQm', apple: APPLE + '2-years-single/1573282063' } },
  { title: 'Demo My Heart', note: 'single · 2021', img: 'demo-my-heart.jpg',
    links: { spotify: SPOTIFY_SEARCH + 'Kostandino%20Demo%20My%20Heart', apple: APPLE + 'demo-my-heart-single/1568477594',
      soundcloud: 'https://soundcloud.com/kosta_sweezy/demo-my-heart' } },
];

// Lines that take turns under the name in the hero. All Kosta's own words:
// his Instagram bio first (it stays up longest), then a post and two covers.
const TAGLINES = [
  'certified overthinker with a melody',
  'it’s never too late',
  'wild and free',
  'time flys',
];
// -----------------------------------------------------------------------

const root = document.documentElement;
const isNight = () => root.dataset.theme === 'night';
const coverFor = (r) => 'assets/img/covers/' + r.img;

// Releases grid
const grid = document.querySelector('.releases');
RELEASES.forEach((r, i) => {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'release';
  card.style.setProperty('--tilt', `${[-2, 1.5, -1, 2, -1.5, 1][i % 6]}deg`);
  card.innerHTML = `
    <img src="${coverFor(r)}" alt="${r.title} cover art" loading="lazy">
    <span class="release-title">${r.title}</span>
    <span class="hand release-note">${r.note}</span>`;
  card.addEventListener('click', () => openSheet(r));
  grid.append(card);
});

// Marquee (duplicated once so the loop is seamless)
const track = document.querySelector('.marquee-track');
const run = RELEASES.map((r) => `<span>${r.title}</span><span class="star">✺</span>`).join('');
track.innerHTML = run + run;

// Release sheet
const sheet = document.querySelector('.sheet');
function openSheet(r) {
  sheet.querySelector('.sheet-cover').src = coverFor(r);
  sheet.querySelector('.sheet-cover').alt = `${r.title} cover art`;
  sheet.querySelector('#sheet-title').textContent = r.title;
  sheet.querySelector('.sheet-note').textContent = r.note;
  sheet.querySelectorAll('[data-link]').forEach((a) => {
    a.hidden = !r.links[a.dataset.link];
    a.href = r.links[a.dataset.link] || '#';
  });
  sheet.showModal();
}
sheet.querySelector('.sheet-close').addEventListener('click', () => sheet.close());
sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });

// Profile links outside the sheet
document.querySelectorAll('main [data-link]').forEach((a) => {
  a.href = LINKS[a.dataset.link];
  a.target = '_blank';
  a.rel = 'noopener';
});

// Day / night
function setTheme(theme) {
  root.dataset.theme = theme;
  try { localStorage.setItem('theme', theme); } catch {}
}
let saved;
try { saved = localStorage.getItem('theme'); } catch {}
if (saved) setTheme(saved);
document.querySelector('.theme-toggle').addEventListener('click', () => {
  setTheme(isNight() ? 'day' : 'night');
});

// Hero tagline: each line fades in, holds, and fades to the next
const tagline = document.querySelector('.tagline');
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let line = 0;
  const next = () => {
    tagline.classList.add('out');
    setTimeout(() => {
      line = (line + 1) % TAGLINES.length;
      tagline.textContent = TAGLINES[line];
      tagline.classList.remove('out');
      setTimeout(next, line === 0 ? 8000 : 5000);
    }, 700);
  };
  setTimeout(next, 8000);
}

// Zobie the mascot: comments on whichever section is in view, hops when clicked,
// and leans into the scroll.
const mascot = document.querySelector('.mascot');
const say = mascot.querySelector('.mascot-say');
const SECTION_LINES = {
  top: 'hi, i’m zobie!',
  latest: 'new song!!',
  music: 'tap a cover!',
  about: 'that’s my guy',
  contact: 'go on, say hi',
};
const CLICK_LINES = ['wheee!', 'boop', 'time flys…', 'not my phone', 'again!', 'wild & free'];
let sayTimer;
function speak(line) {
  say.textContent = line;
  say.classList.add('show');
  clearTimeout(sayTimer);
  sayTimer = setTimeout(() => say.classList.remove('show'), 3500);
}
const watcher = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) speak(SECTION_LINES[e.target.dataset.zobie]); });
}, { rootMargin: '-45% 0px -45% 0px' });
Object.keys(SECTION_LINES).forEach((id) => {
  const el = id === 'top' ? document.querySelector('.hero') : document.getElementById(id);
  el.dataset.zobie = id;
  watcher.observe(el);
});
let clicks = 0;
mascot.addEventListener('click', () => {
  mascot.classList.remove('hop');
  void mascot.offsetWidth; // restart the animation
  mascot.classList.add('hop');
  speak(CLICK_LINES[clicks++ % CLICK_LINES.length]);
});
let lastY = scrollY, leanTimer;
addEventListener('scroll', () => {
  const lean = Math.max(-18, Math.min(18, (scrollY - lastY) * 0.6));
  lastY = scrollY;
  mascot.style.rotate = `${lean}deg`;
  clearTimeout(leanTimer);
  leanTimer = setTimeout(() => { mascot.style.rotate = '0deg'; }, 120);
}, { passive: true });

document.getElementById('year').textContent = new Date().getFullYear();
