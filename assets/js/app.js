const URL_BASE = 'http://api.makeitreal.local:3000';

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

function showDashboard(username) {
  const app = document.getElementById('app');
  const template = document.getElementById('template-home').content;

  const homeSpam = template.querySelector('.home__span');
  homeSpam.innerHTML = `${username}`;

  const fragment = document.createDocumentFragment();
  const clone = template.cloneNode(true);

  fragment.appendChild(clone);
  app.appendChild(fragment);

  document.getElementById('logout').addEventListener('click', (e) => {
    logout();
  });
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
