const routes = {
  catalog: 'Каталог',
  details: 'Про альбом',
  feedback: 'Відгуки',
  design: 'Дизайн-система',
};

const views = document.querySelectorAll('.view');
const navLinks = document.querySelectorAll('.nav-link');

function render() {
  const hash = window.location.hash.slice(1);
  const route = Object.hasOwn(routes, hash) ? hash : 'catalog';

  views.forEach((view) => {
    view.classList.toggle('is-hidden', view.id !== route);
  });

  navLinks.forEach((link) => {
    const active = link.getAttribute('href') === `#${route}`;
    link.classList.toggle('is-active', active);
    if (active) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  document.title = `${routes[route]} — VasyaPlayer`;
}

window.addEventListener('hashchange', render);
render();

const timerValue = document.querySelector('.timer-value');
let seconds = 0;

function formatTime(total) {
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(Math.floor(total % 60)).padStart(2, '0');
  return `${m}:${s}`;
}

window.setInterval(() => {
  seconds += 1;
  timerValue.textContent = formatTime(seconds);
}, 1000);

const audio = document.querySelector('audio');
const rows = document.querySelectorAll('.tracks tbody tr');
const nowTitle = document.querySelector('.now-title');
const nowCover = document.querySelector('.now-cover');
const tiCover = document.querySelector('.ti-cover');
const tiTitle = document.querySelector('.ti-title');
const tiGenre = document.querySelector('.ti-genre');
const tiBpm = document.querySelector('.ti-bpm');
const tiYear = document.querySelector('.ti-year');

const states = document.querySelectorAll('[data-state]');
const stateButtons = document.querySelectorAll('[data-show-state]');
const search = document.querySelector('#track-search');
const reloadButton = document.querySelector('#reload-tracks');
const trackStatus = document.querySelector('#track-status');
const stateMessages = {
  loading: 'Завантажуємо треки…',
  empty: 'Треків не знайдено.',
  error: 'Не вдалося завантажити треки. Код помилки — 503.',
};
let pendingLoad;

function filterTracks() {
  const query = search.value.trim().toLocaleLowerCase('uk');
  let matches = 0;

  rows.forEach((row) => {
    const track = `${row.querySelector('.title').textContent} ${row.querySelector('.artist').textContent} ${row.dataset.genre}`;
    const visible = track.toLocaleLowerCase('uk').includes(query);
    row.classList.toggle('is-hidden', !visible);
    matches += Number(visible);
  });

  return matches;
}

function renderState(stateName) {
  window.clearTimeout(pendingLoad);
  const matches = stateName === 'content' ? filterTracks() : 0;
  const nextState = stateName === 'content' && matches === 0 ? 'empty' : stateName;

  states.forEach((panel) => {
    panel.classList.toggle('is-hidden', panel.dataset.state !== nextState);
  });
  stateButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.showState === nextState));
  });
  trackStatus.textContent = stateMessages[nextState] ?? `Знайдено треків: ${matches}.`;
}

function reloadCatalog() {
  search.value = '';
  renderState('loading');
  pendingLoad = window.setTimeout(() => renderState('content'), 1700);
}

stateButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (button.dataset.showState === 'content') search.value = '';
    renderState(button.dataset.showState);
  });
});

search.addEventListener('input', () => renderState('content'));
reloadButton.addEventListener('click', reloadCatalog);
document.querySelector('#retry-tracks').addEventListener('click', () => {
  reloadCatalog();
  reloadButton.focus();
});
document.querySelector('#reset-search').addEventListener('click', () => {
  search.value = '';
  renderState('content');
  search.focus();
});

const themeToggle = document.querySelector('#theme-toggle');
themeToggle.addEventListener('click', () => {
  const light = document.documentElement.dataset.theme !== 'light';
  document.documentElement.dataset.theme = light ? 'light' : 'dark';
  themeToggle.setAttribute('aria-pressed', String(light));
});

const playbackStatus = document.querySelector('#playback-status');

rows.forEach((row) => {
  const trackButton = row.querySelector('button');
  row.addEventListener('click', () => {
    rows.forEach((track) => {
      track.classList.remove('active');
      track.querySelector('button').removeAttribute('aria-current');
    });
    row.classList.add('active');
    trackButton.setAttribute('aria-current', 'true');

    const title = row.querySelector('.title').textContent;

    audio.src = row.dataset.src;
    nowTitle.textContent = title;
    nowCover.src = row.querySelector('img').src;
    tiTitle.textContent = title;
    tiCover.src = row.querySelector('img').src;
    tiGenre.textContent = row.dataset.genre;
    tiBpm.textContent = row.dataset.bpm;
    tiYear.textContent = row.dataset.year;
    playbackStatus.textContent = '';
    audio.play().catch((error) => {
      if (error.name !== 'AbortError') playbackStatus.textContent = 'Не вдалося відтворити трек.';
    });
  });

  const meta = new Audio();
  meta.preload = 'metadata';
  meta.addEventListener('loadedmetadata', () => {
    row.querySelector('.time').textContent = formatTime(meta.duration);
  });
  meta.src = row.dataset.src;
});

const form = document.querySelector('.review-form');
const nameInput = document.querySelector('#name');
const textInput = document.querySelector('#text');
const list = document.querySelector('.review-list');
const reviewsCount = document.querySelector('.reviews-count');
const reviewStatus = document.querySelector('#review-status');

function validateReview(name, text) {
  const nameLength = typeof name === 'string' ? name.trim().length : 0;
  const textLength = typeof text === 'string' ? text.trim().length : 0;

  return {
    name: nameLength >= 2 && nameLength <= 80,
    text: textLength >= 10 && textLength <= 300,
  };
}

function setError(input, message) {
  input.parentElement.querySelector('.error').textContent = message;
  input.classList.toggle('invalid', message !== '');
  input.setAttribute('aria-invalid', String(message !== ''));
}

[nameInput, textInput].forEach((input) => {
  input.addEventListener('input', () => setError(input, ''));
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const text = textInput.value.trim();
  const valid = validateReview(name, text);
  setError(nameInput, valid.name ? '' : 'Введіть від 2 до 80 символів.');
  setError(textInput, valid.text ? '' : 'Введіть від 10 до 300 символів.');
  reviewStatus.textContent = '';
  if (!valid.name || !valid.text) {
    (valid.name ? textInput : nameInput).focus();
    return;
  }

  const item = document.createElement('li');
  item.classList.add('review');
  const author = document.createElement('p');
  author.classList.add('review-author');
  author.textContent = name;
  const body = document.createElement('p');
  body.textContent = text;
  item.append(author, body);
  list.prepend(item);

  reviewsCount.textContent = list.children.length;
  form.reset();
  reviewStatus.textContent = 'Відгук додано.';
});
