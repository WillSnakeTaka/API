const catsList = document.getElementById('cats-list');
const meowsList = document.getElementById('meows-list');
const catSelect = document.getElementById('cat-select');
const catForm = document.getElementById('cat-form');
const meowForm = document.getElementById('meow-form');
const catPic = document.getElementById('cat-pic');
const catGif = document.getElementById('cat-gif');
const refreshPic = document.getElementById('refresh-pic');
const refreshGif = document.getElementById('refresh-gif');
const FALLBACK_PIC = 'https://cdn2.thecatapi.com/images/MTY3ODIyMQ.jpg';
const FALLBACK_GIF = 'https://cdn2.thecatapi.com/images/7r4.gif';

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

function loadCatPic() {
  return fetch('https://api.thecatapi.com/v1/images/search')
    .then((response) => response.json())
    .then((data) => {
      catPic.src = data?.[0]?.url || 'https://cataas.com/cat';
    })
    .catch(() => {
      catPic.src = 'https://cataas.com/cat';
    });
}

function loadCatGif() {
  return fetch('https://api.thecatapi.com/v1/images/search?mime_types=gif')
    .then((response) => response.json())
    .then((data) => {
      catGif.src = data?.[0]?.url || 'https://cataas.com/cat/gif';
    })
    .catch(() => {
      catGif.src = 'https://cataas.com/cat/gif';
    });
}

function renderCats(cats) {
  catsList.innerHTML = '';
  catSelect.innerHTML = '';

  cats.forEach((cat) => {
    const item = document.createElement('li');
    item.textContent = `${cat.name} (${cat.breed || 'Unknown'})`;
    catsList.appendChild(item);

    const option = document.createElement('option');
    option.value = cat._id;
    option.textContent = cat.name;
    catSelect.appendChild(option);
  });
}

function renderMeows(meows) {
  meowsList.innerHTML = '';
  meows.forEach((meow) => {
    const item = document.createElement('li');
    const catName = meow.catId?.name || 'Unknown Cat';
    item.textContent = `${catName}: ${meow.text}`;
    meowsList.appendChild(item);
  });
}

async function loadData() {
  try {
    const catsResponse = await fetchJSON('/cats');
    const meowsResponse = await fetchJSON('/meows');
    renderCats(catsResponse.items || []);
    renderMeows(meowsResponse.items || []);
  } catch (error) {
    console.error(error.message);
  }
}

catForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(catForm);

  try {
    await fetchJSON('/cats', {
      method: 'POST',
      body: JSON.stringify({
        name: formData.get('name'),
        breed: formData.get('breed'),
      }),
    });
    catForm.reset();
    await loadData();
  } catch (error) {
    alert(error.message);
  }
});

meowForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(meowForm);

  try {
    await fetchJSON('/meows', {
      method: 'POST',
      body: JSON.stringify({
        catId: formData.get('catId'),
        text: formData.get('text'),
      }),
    });
    meowForm.reset();
    await loadData();
  } catch (error) {
    alert(error.message);
  }
});

refreshPic.addEventListener('click', loadCatPic);
refreshGif.addEventListener('click', loadCatGif);
catPic.addEventListener('error', () => {
  catPic.src = FALLBACK_PIC;
});
catGif.addEventListener('error', () => {
  catGif.src = FALLBACK_GIF;
});

loadData();
loadCatPic();
loadCatGif();
