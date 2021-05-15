const URL_BASE = 'http://api.makeitreal.local:3000';
const DIV_APP = document.getElementById('app');

function showFormLogin() {
  const app = document.getElementById('app');
  const template = document.getElementById('template-app').content;

  const fragment = document.createDocumentFragment();
  const clone = template.cloneNode(true);

  fragment.appendChild(clone);
  app.appendChild(fragment);
}

function removeFormLogin() {
  const divLogin = document.querySelector('div.form');
  divLogin.parentElement.removeChild(divLogin);
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
        localStorage.setItem('username', json.data.username);
        localStorage.setItem('name', json.data.name);
      } else {
        console.log('else');
      }
    });
}

document.addEventListener('DOMContentLoaded', () => {
  showFormLogin();

  document.getElementById('form-login').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('form-login').elements;
    const username = input.username.value;
    const password = input.password.value;
    login(username, password);
  });

  console.log('Todo cargado!');
});
