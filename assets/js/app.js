const URL_BASE = 'http://api.makeitreal.local:3000';

function timeFromNow(time) {
  // Credits to
  // https://gomakethings.com/a-vanilla-js-alternative-to-the-moment.js-timefromnow-method/
  // https://www.toptal.com/software/definitive-guide-to-datetime-manipulation
  // Get timestamps
  const unixTime = new Date(time).getTime();
  if (!unixTime) return;
  const now = new Date().getTime();

  // Calculate difference
  let difference = unixTime / 1000 - now / 1000;

  // Setup return object
  const tfn = {};

  // Check if time is in the past, present, or future
  tfn.when = 'now';
  if (difference > 0) {
    tfn.when = 'future';
  } else if (difference < -1) {
    tfn.when = 'past';
  }

  // Convert difference to absolute
  difference = Math.abs(difference);

  // Calculate time unit
  if (difference / (60 * 60 * 24 * 365) > 1) {
    // Years
    tfn.unitOfTime = 'y';
    tfn.time = Math.floor(difference / (60 * 60 * 24 * 365));
  } else if (difference / (60 * 60 * 24 * 45) > 1) {
    // Months
    tfn.unitOfTime = 'm';
    tfn.time = Math.floor(difference / (60 * 60 * 24 * 45));
  } else if (difference / (60 * 60 * 24) > 1) {
    // Days
    tfn.unitOfTime = 'd';
    tfn.time = Math.floor(difference / (60 * 60 * 24));
  } else if (difference / (60 * 60) > 1) {
    // Hours
    tfn.unitOfTime = 'h';
    tfn.time = Math.floor(difference / (60 * 60));
  } else if (difference / 60 > 1) {
    // Hours
    tfn.unitOfTime = 'min';
    tfn.time = Math.floor(difference / 60);
  } else if (difference < 2) {
    // Seconds
    tfn.unitOfTime = '';
    tfn.time = 'now';
    // eslint-disable-next-line no-lonely-if
  } else {
    tfn.unitOfTime = 's';
    tfn.time = Math.floor(difference);
  }
  // Return time from now data
  return tfn;
}

function removeForm() {
  const divForm = document.querySelector('div.form');
  divForm.parentElement.removeChild(divForm);
}

function removeDashboard() {
  const divHome = document.querySelector('div.home');
  divHome.parentElement.removeChild(divHome);
}

function login(username, password) {
  const user = {
    username,
    password,
  };

  const options = {
    method: 'POST',
    body: JSON.stringify(user),
    withCredentials: true,
    credentials: 'include',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  fetch(`${URL_BASE}/api/users/login`, options)
    .then((res) => res.json())
    .then((json) => {
      if (json.message === 'ok') {
        const now = new Date();
        // one hour, lifetime.
        const expireTime = now.getTime() + 60 * 60 * 24 * 1000;
        const dataUser = {
          username: json.data.username,
          name: json.data.name,
          expiry: expireTime,
        };
        localStorage.setItem('userdata', JSON.stringify(dataUser));
        removeForm();
        init();
      } else {
        const message = document.querySelector('p.form__message');
        message.classList.remove('display-none');
        message.style.display = 'block';
        message.innerHTML = json.message;
      }
    })
    .catch((error) => console.log(error));
}

function showFormLogin() {
  const app = document.getElementById('app');
  const template = document.getElementById('template-login').content;

  const fragment = document.createDocumentFragment();
  const clone = template.cloneNode(true);

  fragment.appendChild(clone);
  app.appendChild(fragment);

  document
    .getElementById('form-link-register')
    .addEventListener('click', (e) => {
      removeForm();
      showFormRegister();
    });

  document.getElementById('form-login').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('form-login');
    const username = input.elements.username.value;
    const password = input.elements.password.value;
    login(username, password);
  });
}

function logout() {
  // TODO Falta implementar logout, para que el token sea revocado, el en backend.
  const dashboard = document.querySelector('.home') || undefined;
  fetch(`${URL_BASE}/api/users/logout`);

  if (dashboard) {
    removeDashboard();
  }
  localStorage.removeItem('userdata');
  showFormLogin();
}

function loadTweets() {
  const articles = document.getElementById('articles');
  const options = {
    method: 'GET',
    withCredentials: true,
    credentials: 'include',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  fetch(`${URL_BASE}/api/tweets/`, options)
    .then((res) => res.json())
    .then((json) => {
      document.getElementById('textarea-tweet').value = '';
      if (json.data.length > 0) {
        articles.innerHTML = '';
        const template = document.getElementById('template-tweets').content;

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < json.data.length; i++) {
          const difference = timeFromNow(json.data[i].createdAt);

          const spamUser = template.getElementById('tweets-user');
          spamUser.innerHTML = `${json.data[i].user.name}`;

          const spamUsername = template.getElementById('tweets-username');
          spamUsername.innerHTML = `${json.data[i].user.username}`;

          const textDate = template.getElementById('tweets-date');
          textDate.innerHTML = `${difference.time}${difference.unitOfTime}`;

          const textMessage = template.getElementById('tweet-message');
          textMessage.innerHTML = `${json.data[i].content}`;

          const fragment = document.createDocumentFragment();
          const clone = template.cloneNode(true);

          fragment.appendChild(clone);
          articles.appendChild(fragment);
        }
      } else {
        const divArticles = document.getElementById('articles');
        divArticles.innerHTML = '<p>You currently have no tweets!</p>';
      }
    });
}

function createTweet() {
  const input = document.getElementById('form-tweet');
  const tweet = {
    content: input.elements.tweet.value.trim(),
  };
  const options = {
    method: 'POST',
    body: JSON.stringify(tweet),
    withCredentials: true,
    credentials: 'include',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // eslint-disable-next-line no-undef
  Notiflix.Notify.Init({ position: 'center-bottom', with: '100%' });

  fetch(`${URL_BASE}/api/tweets/`, options)
    .then((res) => res.json())
    .then((json) => {
      // eslint-disable-next-line no-undef
      Notiflix.Notify.Success('Tweet creado corrrectamente');
      loadTweets();
    })
    .catch((err) => {
      // eslint-disable-next-line no-undef
      Notiflix.Notify.Failure('Error al intentar crear el Tweet');
    });
}

function showDashboard(username) {
  const app = document.getElementById('app');
  const template = document.getElementById('template-home').content;

  const homeSpam = template.querySelector('.home__span');
  homeSpam.innerHTML = `${username}`;

  const fragment = document.createDocumentFragment();
  const clone = template.cloneNode(true);

  fragment.appendChild(clone);
  app.appendChild(fragment);

  document.getElementById('logout').addEventListener('click', () => {
    logout();
  });

  document.getElementById('form-tweet').addEventListener('submit', (e) => {
    e.preventDefault();
    createTweet();
  });

  loadTweets();
}

function init() {
  const userData = JSON.parse(localStorage.getItem('userdata'));
  showDashboard(userData.username);
}

function showFormRegister() {
  const app = document.getElementById('app');
  const template = document.getElementById('template-signup').content;

  const fragment = document.createDocumentFragment();
  const clone = template.cloneNode(true);

  fragment.appendChild(clone);
  app.appendChild(fragment);

  document.getElementById('form-link-login').addEventListener('click', (e) => {
    removeForm();
    showFormLogin();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const userData = JSON.parse(localStorage.getItem('userdata')) || false;
  const expiryTime = userData.expiry || false;
  const now = new Date().getTime();

  if (!userData || now > expiryTime) {
    logout();
  } else {
    init();
  }
});
