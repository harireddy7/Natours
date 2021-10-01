export const hideAlert = () => {
  const alertEl = document.querySelector('.alert');
  if (alertEl) {
    alertEl.parentElement.removeChild(alertEl);
  }
};

// type = success || error
export const showAlert = (type, message, timeout = 5000) => {
  const markUp = `<div class="alert alert--${type}>${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markUp);

  window.setTimeout(hideAlert, timeout);
};
