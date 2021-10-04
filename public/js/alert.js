export const hideAlert = () => {
  const alertEl = document.querySelector('.alert');
  if (alertEl) {
    alertEl.parentElement.removeChild(alertEl);
  }
};

// type = success || error
export const showAlert = (type, message, timeout = 5000) => {
  const alertEl = document.createElement('div');
  alertEl.className = `alert alert--${type}`;
  alertEl.textContent = message;
  document.querySelector('body').insertAdjacentElement('afterbegin', alertEl);

  window.setTimeout(hideAlert, timeout);
};
