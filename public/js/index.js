import '@babel/polyfill';
import { loginUser } from './login';
import { displayMap } from './mapbox';

// DOM elements
const formEl = document.querySelector('.form');
const mapEl = document.getElementById('map');

// Get tour locations
if (mapEl) {
  const locations = mapEl ? JSON.parse(mapEl?.dataset.locations) : [];
  displayMap(locations);
}

// Login submit event listener
if (formEl) {
  formEl.addEventListener('submit', (e) => {
    e.preventDefault();

    // Form values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    loginUser(email, password);
  });
}
