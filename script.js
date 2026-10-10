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
const APPLE_ARTIST_ID = 1568477597; // used to fetch the 30-second previews
const SPOTIFY = 'https://open.spotify.com/track/';
// TODO: Planet, Aurora and Demo My Heart use a Spotify search until Kosta sends their direct links.
const SPOTIFY_SEARCH = 'https://open.spotify.com/search/';
const RELEASES = [
  { title: 'Willow', note: 'single · 2026', img: 'willow.jpg', isNew: true,
    links: { spotify: SPOTIFY + '4Q93FwXEhfIGorU4pDBz6H', apple: APPLE + 'willow-single/6794258295' } },
  { title: 'Way Back', note: 'single · 2025', img: 'way-back.jpg',
    links: { spotify: SPOTIFY + '5uOQFMkOszuv7YzCdc0JRe', apple: APPLE + 'way-back-single/1797192500' } },
  { title: 'Showing Off', note: 'single · 2024', img: 'showing-off.jpg',
    links: { spotify: SPOTIFY + '5baDKmhhPVbR0tg2s16eMX', apple: APPLE + 'showing-off-single/1778623211' } },
  { title: 'Picky', note: 'single · 2023', img: 'picky.jpg',
    links: { spotify: SPOTIFY + '5NpYhIiYcllEQnmgrbIWVt', apple: APPLE + 'picky-single/1717760333' } },
  { title: "Bella's Ranger", note: 'single · 2023', img: 'bellas-ranger.jpg',
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
    <span class="hand release-note">${r.note}</span>
    ${r.isNew ? '<span class="sticker-new">new single</span>' : ''}`;
  card.addEventListener('click', () => openSheet(r));
  grid.append(card);
});

// Marquee (duplicated once so the loop is seamless); each title opens that song
const track = document.querySelector('.marquee-track');
const run = RELEASES.map((r, i) => `<button type="button" tabindex="-1" data-release="${i}">${r.title}</button><svg class="wave"><use href="#wave"/></svg>`).join('');
track.innerHTML = run + run;
track.addEventListener('click', (e) => {
  const button = e.target.closest('[data-release]');
  if (button) openSheet(RELEASES[button.dataset.release]);
});

// The deck on the front page: all releases fanned out, the current one in front.
// Tapping the front cover plays it in the Spotify player (a 30-second clip unless
// you are logged in); tapping a side cover brings it to the front.
const deck = document.querySelector('.deck');
const playBtn = document.querySelector('.deck-play');
const audio = document.querySelector('.preview');
const scrubber = document.querySelector('.scrubber');
const timeNow = document.querySelector('.time-now');
const timeEnd = document.querySelector('.time-end');
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const sheet = document.querySelector('.sheet');
let loaded = null;   // the release currently in the player
let paused = true;
let scrubbing = false;
const caption = document.querySelector('.deck-caption');
let current = 0;
const deckCards = RELEASES.map((r, i) => {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'card';
  card.innerHTML = `<img src="${coverFor(r)}" alt="${r.title} cover art">
    <span class="play-badge" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#ic-play"/></svg></span>
    ${r.isNew ? '<span class="sticker-new">new single</span>' : ''}`;
  card.addEventListener('click', () => (i === current ? playRelease(r) : showCard(i)));
  deck.append(card);
  return card;
});
function showCard(i) {
  current = (i + RELEASES.length) % RELEASES.length;
  // the player always describes the cover in front, so flipping away from a playing song stops it
  if (loaded && loaded !== RELEASES[current] && !audio.paused) audio.pause();
  deckCards.forEach((card, k) => {
    let off = k - current;
    if (off > RELEASES.length / 2) off -= RELEASES.length;
    if (off < -RELEASES.length / 2) off += RELEASES.length;
    card.dataset.off = Math.max(-3, Math.min(3, off));
    card.tabIndex = off === 0 ? 0 : -1;
    card.setAttribute('aria-label', off === 0 ? `Play ${RELEASES[k].title}` : `Show ${RELEASES[k].title}`);
  });
  refreshPlayState();
}
document.querySelector('.deck-arrow.prev').addEventListener('click', () => showCard(current - 1));
document.querySelector('.deck-arrow.next').addEventListener('click', () => showCard(current + 1));
document.querySelector('.deck-play').addEventListener('click', () => playRelease(RELEASES[current]));
addEventListener('keydown', (e) => {
  if (document.activeElement.closest && document.activeElement.closest('.deck-wrap')) {
    if (e.key === 'ArrowLeft') showCard(current - 1);
    if (e.key === 'ArrowRight') showCard(current + 1);
  }
});
showCard(0);
// Play / pause. The 30-second previews come from Apple's public catalogue
// (looked up by the release's Apple Music id), played in a plain audio element.
// Apple collection id -> preview url (first track of an album). These were fetched
// on 2026-10-06 and are refreshed at load time via JSONP below in case Apple moves them.
const previews = {
  1568477594: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/30/a1/0e/30a10e80-fd2e-bed2-a7ec-3f82b6290e73/mzaf_3187424553767249747.plus.aac.p.m4a',
  1573282063: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/88/6a/83/886a83f2-5322-2277-8979-802c9e0991ca/mzaf_6162233335309028096.plus.aac.p.m4a',
  1619951307: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/41/7c/17/417c1754-ed71-beb1-4639-e882fb2ecc18/mzaf_1521034258095123094.plus.aac.p.m4a',
  1644307799: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/b3/20/26/b32026bb-76d7-b676-467e-4b0338047830/mzaf_16532488931625815216.plus.aac.p.m4a',
  1675474994: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/52/55/8b/52558bd6-743e-659a-7516-61fcdb4569df/mzaf_11808898983719677516.plus.aac.p.m4a',
  1717760333: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/9c/c6/8c/9cc68c61-5480-a2ef-eaec-b7e1d9863211/mzaf_12972068808863687508.plus.aac.p.m4a',
  1778623211: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/7f/28/15/7f2815c8-4b65-638f-0cdc-f557117ec271/mzaf_15933266566538594275.plus.aac.p.m4a',
  1797192500: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ea/4e/ad/ea4ead7f-287a-d8cb-9390-eb4c0d5eb603/mzaf_7118763331381946350.plus.aac.p.m4a',
  6794258295: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/47/7e/4e/477e4e8b-761e-ff64-d40c-e57542c32489/mzaf_6686217302876156328.plus.aac.p.m4a'
};
window.onApplePreviews = (data) => {
  data.results.forEach((t) => {
    if (t.wrapperType === 'track' && t.previewUrl && t.trackNumber === 1) previews[t.collectionId] = t.previewUrl;
  });
};
const jsonp = document.createElement('script');
jsonp.src = `https://itunes.apple.com/lookup?id=${APPLE_ARTIST_ID}&entity=song&limit=200&callback=onApplePreviews`;
document.head.append(jsonp);
const appleId = (r) => r.links.apple.split('/').pop();
function playRelease(r) {
  const url = previews[appleId(r)];
  if (!url) { openSheet(r); return; } // previews not loaded (offline?): show the links instead
  if (loaded === r) { audio.paused ? audio.play() : audio.pause(); return; }
  loaded = r;
  audio.src = url;
  audio.play();
}
audio.addEventListener('play', () => { paused = false; refreshPlayState(); });
audio.addEventListener('pause', () => { paused = true; refreshPlayState(); });
audio.addEventListener('ended', () => { paused = true; refreshPlayState(); });
audio.addEventListener('loadedmetadata', () => {
  scrubber.max = audio.duration;
  timeEnd.textContent = fmt(audio.duration);
});
audio.addEventListener('timeupdate', () => {
  if (!scrubbing) scrubber.value = audio.currentTime;
  timeNow.textContent = fmt(audio.currentTime);
  scrubber.style.setProperty('--p', `${audio.duration ? (audio.currentTime / audio.duration) * 100 : 0}%`);
});
scrubber.addEventListener('pointerdown', () => { scrubbing = true; });
scrubber.addEventListener('input', () => {
  // dragging the scrubber on a song that is not loaded loads it first
  if (!loaded) { loaded = RELEASES[current]; audio.src = previews[appleId(loaded)]; }
  audio.currentTime = scrubber.value;
  timeNow.textContent = fmt(scrubber.value);
});
scrubber.addEventListener('change', () => { scrubbing = false; });
function refreshPlayState() {
  const r = RELEASES[current];
  const playing = loaded === r && !paused;
  deckCards.forEach((card, k) => {
    const on = loaded === RELEASES[k] && !paused;
    card.querySelector('.play-badge use').setAttribute('href', on ? '#ic-pause' : '#ic-play');
  });
  playBtn.querySelector('.icon use').setAttribute('href', playing ? '#ic-pause' : '#ic-play');
  playBtn.setAttribute('aria-label', playing ? 'Pause' : `Play ${r.title}`);
  playBtn.classList.toggle('playing', playing);
  caption.textContent = `${r.title} · ${r.note}`;
  if (loaded !== r) { scrubber.value = 0; scrubber.style.setProperty('--p', '0%'); timeNow.textContent = '0:00'; }
  document.querySelector('.preview-spotify').href = r.links.spotify;
  document.querySelector('.preview-apple').href = r.links.apple;
}

// Release sheet
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

// Zobie behind the deck: idles peeking, and every so often does one random bit.
// Each bit is a CSS animation on .deck-wrap (see styles.css); the class is removed when it ends.
const deckWrap = document.querySelector('.deck-wrap');
const BITS = [
  { name: 'duck', ms: 3200 },   // drops out of sight, pops up on the other side
  { name: 'dash', ms: 2600 },   // runs across the top of the covers
  { name: 'hug', ms: 3000 },    // grabs the front cover with both hands
  { name: 'spin', ms: 1400 },   // quick twirl
  { name: 'boo', ms: 2200 },    // pops up big, then shrinks back
];
let lastBit = null;
function doBit() {
  let bit;
  do { bit = BITS[Math.floor(Math.random() * BITS.length)]; } while (bit === lastBit);
  lastBit = bit;
  deckWrap.classList.add(`bit-${bit.name}`);
  setTimeout(() => {
    deckWrap.classList.remove(`bit-${bit.name}`);
    scheduleBit();
  }, bit.ms);
}
function scheduleBit() { setTimeout(doBit, 8000 + Math.random() * 7000); }
// ?demo in the URL runs every bit back to back, once, then settles into the normal rhythm
function demoBits(i = 0) {
  if (i >= BITS.length) { scheduleBit(); return; }
  deckWrap.classList.add(`bit-${BITS[i].name}`);
  setTimeout(() => { deckWrap.classList.remove(`bit-${BITS[i].name}`); setTimeout(() => demoBits(i + 1), 700); }, BITS[i].ms);
}
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  if (new URLSearchParams(location.search).has('demo')) setTimeout(demoBits, 1500);
  else scheduleBit();
}

// Zobie the mascot: comments on whichever section is in view, hops when clicked,
// and leans into the scroll.
const mascot = document.querySelector('.mascot');
const say = mascot.querySelector('.mascot-say');
const SECTION_LINES = {
  top: 'flip through my songs!',
  latest: 'new song!!',
  music: 'tap a cover!',
  about: 'that’s my guy',
  contact: 'go on, say hi',
};
const CLICK_LINES = ['wheee!', 'boop', 'time flys…', 'not my phone', 'again!', 'wild & free'];
// Easter egg: every 10th click on Zobie reveals what one letter of his name means.
const ZOBIE_MEANINGS = [
  'Z — you don’t have to stick out to be unique',
  'O — because my name has two Os',
  'B — be yourself (it ain’t that deep)',
  'I — introverted',
  'E — extroverted',
];
let sayTimer;
function speak(line, hold = 3500) {
  say.textContent = line;
  say.classList.add('show');
  clearTimeout(sayTimer);
  sayTimer = setTimeout(() => say.classList.remove('show'), hold);
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
  clicks++;
  if (clicks % 10 === 0) {
    speak(ZOBIE_MEANINGS[(clicks / 10 - 1) % ZOBIE_MEANINGS.length], 7000);
  } else {
    speak(CLICK_LINES[clicks % CLICK_LINES.length]);
  }
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
