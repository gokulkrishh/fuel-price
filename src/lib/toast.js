export function toast(msg = "", options = 3000) {
  if (!msg) return;
  const toastElement = document.querySelector('.toast');
  toastElement.textContent = msg;
  toastElement.classList.add("toast--show");

  function hideNotification() {
    window.cancelTimeout = setTimeout(() => {
      toastElement.classList.remove("toast--show");
      window.cancelTimeout = "";
    }, options);
  }

  if (window.cancelTimeout) clearTimeout(window.cancelTimeout);
  hideNotification();
}
