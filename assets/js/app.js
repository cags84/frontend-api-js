const URL_BASE = 'http://api.makeitreal.local:3000';

function removeForm() {
  const divForm = document.querySelector('div.form');
  divForm.parentElement.removeChild(divForm);
}

function showDashboard(username) {
  const app = document.getElementById('app');
  const template = document.getElementById('template-home').content;

  const divHome = template.querySelector('.home');
  divHome.innerHTML = `<p>Hola ${username}</p>`;

  const fragment = document.createDocumentFragment();
  const clone = divHome.cloneNode(true);

  fragment.appendChild(clone);
  app.appendChild(fragment);
}

function init() {
  const userData = JSON.parse(localStorage.getItem('userdata'));
  showDashboard(userData.name);
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
      console.log(json);
      if (json.message === 'ok') {
        const expireTime = 60 * 60 * 24 * 1000;
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
      console.log(e.target);
      removeForm();
      showFormRegister();
    });

  document.getElementById('form-login').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('form-login');
    console.log(input.action.split('/')[3]);
    const username = input.elements.username.value;
    const password = input.elements.password.value;
    console.log(username, password, 'hola');
    login(username, password);
  });
}

function showFormRegister() {
  const app = document.getElementById('app');
  const template = document.getElementById('template-signup').content;

  const fragment = document.createDocumentFragment();
  const clone = template.cloneNode(true);

  fragment.appendChild(clone);
  app.appendChild(fragment);

  document.getElementById('form-link-login').addEventListener('click', (e) => {
    console.log(e);
    removeForm();
    showFormLogin();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const userData = JSON.parse(localStorage.getItem('userdata')) || undefined;
  if (!userData) {
    showFormLogin();
  } else {
    init();
  }
});
