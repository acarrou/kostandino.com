// ---- Edit these -------------------------------------------------------
// Profile links used by the footer/contact buttons and as the fallback
// for any release that has no link of its own.
const LINKS = {
  spotify: '#',
  apple: '#',
  youtube: '#',
  instagram: '#',
  tiktok: '#',
};

// One entry per release. `links` can override spotify/apple/youtube per release.
const RELEASES = [
  { title: 'Summer Vibes', note: 'not my phone', img: 'summer-vibes.jpg' },
  { title: 'Soleil et Toi', note: 'wild and free', img: 'soleil-et-toi.jpg' },
  { title: 'Fools Gold', note: 'shiny, but is it real?', img: 'fools-gold.jpg' },
  { title: 'Rabbit Hole', note: 'lights on, nobody home', img: 'rabbit-hole.jpg' },
  { title: 'Time Flys', note: 'blink and it’s gone', img: 'time-flys.jpg' },
  { title: 'Fall', note: 'love: |luv| – n.', img: 'fall-day.jpg', nightImg: 'fall-night.jpg' },
];
// -----------------------------------------------------------------------

const IMG = 'assets/img/';
const root = document.documentElement;
const isNight = () => root.dataset.theme === 'night';
const coverFor = (r) => IMG + (isNight() && r.nightImg ? r.nightImg : r.img);

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
  r.el = card;
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
    a.href = (r.links && r.links[a.dataset.link]) || LINKS[a.dataset.link];
  });
  sheet.showModal();
}
sheet.querySelector('.sheet-close').addEventListener('click', () => sheet.close());
sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });

// Profile links outside the sheet
document.querySelectorAll('main [data-link], footer [data-link]').forEach((a) => {
  a.href = LINKS[a.dataset.link];
  if (a.href.startsWith('http')) { a.target = '_blank'; a.rel = 'noopener'; }
});

// Day / night
function setTheme(theme) {
  root.dataset.theme = theme;
  RELEASES.forEach((r) => { if (r.nightImg) r.el.querySelector('img').src = coverFor(r); });
  try { localStorage.setItem('theme', theme); } catch {}
}
let saved;
try { saved = localStorage.getItem('theme'); } catch {}
if (saved) setTheme(saved);
document.querySelector('.theme-toggle').addEventListener('click', () => {
  setTheme(isNight() ? 'day' : 'night');
});

// Zobie the mascot: comments on whichever section is in view, hops when clicked,
// and leans into the scroll.
const mascot = document.querySelector('.mascot');
const say = mascot.querySelector('.mascot-say');
const SECTION_LINES = {
  top: 'hi, i’m zobie!',
  music: 'tap a cover!',
  about: 'that’s my guy',
  'zobie-section': 'hey, that’s me',
  sketchbook: 'scroll sideways →',
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
