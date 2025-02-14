// Read file csv in local
function processCSV() {
  const fileInput = document.getElementById("file-input");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a CSV file first.");
    return;
  }

  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    complete: async function (results) {
      const users = results.data
        .filter((row) => row.userName && row.passWord) // Filter out blank or invalid rows
        .map((row) => ({
          userName: row.userName,
          passWord: row.passWord,
        }));

      console.log(users);
      // Add each user account
      for (const user of users) {
        await addListAccount(user.userName, user.passWord);
      }
    },
    error: function (error) {
      showToast("Warning", "Error reading CSV file!", "warning");
      console.warn("Error reading CSV file:", error);
    },
  });
}

// Add list account customer
async function addListAccount(username, password) {
  const accountType = "customer";
  try {
    const response = await fetchWithAuth(`${apiUrl}/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accountType, username, password }),
    });
    if (!response.ok) {
      showToast("Success", "CSV file processed successfully!", "danger");
      throw new Error("Failed to create account");
    }
    hideModal("uploadCSVModal");
    showToast("Success", "Add account by CSV successfully!", "success");
  } catch (error) {
    showToast("Fail", "Add account fail. Please try again!", "danger");
    console.warn("Error creating account:", error);
  }
}
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
