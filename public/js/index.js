import '@babel/polyfill';
import { loginUser, logoutUser } from './login';
import { updateSettings } from './updateSettings';
import { displayMap } from './mapbox';
import { bookTour } from './stripe';

// DOM elements
const loginFormEl = document.querySelector('#login-form');
const mapEl = document.getElementById('map');
const logoutBtn = document.getElementById('logout');
const saveSettingsFormEl = document.querySelector('#save-settings');
const savePasswordFormEl = document.querySelector('#save-password');
const bookTourEl = document.querySelector('#book-tour');

// window.scroll({ top: 0, left: 0, behavior: 'smooth' });

// Get tour locations
if (mapEl) {
  const locations = mapEl ? JSON.parse(mapEl?.dataset.locations) : [];
  displayMap(locations);
}

// Login submit event listener
if (loginFormEl) {
  loginFormEl.addEventListener('submit', (e) => {
    e.preventDefault();

    // Form values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    loginUser(email, password);
  });
}

// Save user settings submit event listener
if (saveSettingsFormEl) {
  saveSettingsFormEl.addEventListener('submit', (e) => {
    e.preventDefault();

    const form = new FormData();

    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings({
      type: 'user-data',
      data: form
    });
  });
}

// Save user password submit event listener
if (savePasswordFormEl) {
  savePasswordFormEl.addEventListener('submit', (e) => {
    e.preventDefault();

    // show btn progress
    document.getElementById('save-password-btn').textContent = 'Saving...';

    // Form values
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;

    updateSettings({
      type: 'password',
      data: {
        currentPassword,
        password,
        confirmPassword
      }
    });
  });
}

// Book a tour
if (bookTourEl) {
  bookTourEl.addEventListener('click', (e) => {
    e.preventDefault();

    // show btn progress
    const tourId = bookTourEl.dataset.tour_id;
    bookTourEl.textContent = 'Processing...';

    bookTour(tourId);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logoutUser);
}
