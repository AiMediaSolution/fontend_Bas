function showToast(title, message, type) {
  const toast = new bootstrap.Toast(document.getElementById("csv-toast"));
  document.getElementById("toast-title").textContent = title;
  document.getElementById("toast-body").textContent = message;
  document.getElementById("csv-toast").classList.add(`text-bg-${type}`);
  toast.show();
}
function hideModal(modalId) {
  const modalElement = document.getElementById(modalId);
  if (modalElement) {
    const modalInstance =
      bootstrap.Modal.getInstance(modalElement) ||
      new bootstrap.Modal(modalElement);
    modalInstance.hide();
  } else {
    console.warn(`Modal with ID '${modalId}' not found.`);
  }
}
function showModal(modal) {
  const modalElement = document.getElementById(modal);
  if (modalElement) {
    const modalInstance =
      bootstrap.Modal.getInstance(modalElement) ||
      new bootstrap.Modal(modalElement);
    modalInstance.show();
  } else {
    console.warn(`Modal with ID '${modal}' not found.`);
  }
}
