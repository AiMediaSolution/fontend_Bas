document.getElementById("createForm").addEventListener("submit", addAccount);
document.getElementById("editForm").addEventListener("submit", editAccount);
document.getElementById("deleteForm").addEventListener("submit", deleteAccount);
document
  .getElementById("restoreForm")
  .addEventListener("submit", restoreAccount);

async function addAccount(e) {
  e.preventDefault();
  const accountType = document.getElementById("account-type").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetchWithAuth(`${apiUrl}/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accountType, username, password }),
    });

    if (!response.ok) {
      showToast("Fail", "Add account fail. Please try again!", "danger");
      throw new Error("Failed to create account");
    }
    hideModal("addAccountModal");
    showToast("Success", "Add account successfully!", "success");
  } catch (error) {
    showToast("Fail", "Add account fail. Please try again!", "danger");
  }
}

// Open Edit Modal
function openEditModal(accountId, accountType, username) {
  document.getElementById("editAccountId").value = accountId;
  document.getElementById("editAccountType").value = accountType;
  document.getElementById("editUsername").value = username;
  document.getElementById("editPassword").value = "";
  showModal("editAccountModal");
}

// Function to edit an account
async function editAccount(e) {
  e.preventDefault();
  const accountId = document.getElementById("editAccountId").value;
  const accountType = document.getElementById("editAccountType").value;
  const username = document.getElementById("editUsername").value;
  const password = document.getElementById("editPassword").value;
  const response = await fetchWithAuth(`${apiUrl}/admin/${accountId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ accountType, username, password }),
  });

  if (response.ok) {
    fetchAccounts();
    hideModal("editAccountModal");
    showToast("Success", "Edit account successfully!", "success");
  } else {
    showToast("Fail", "Edit account fail. Please try again!", "danger");
  }
}

// Open Modal to delete account
function openDeleteModal(accountId, userName) {
  console.log(accountId, userName);
  document.getElementById("deleteAccountId").value = accountId;
  document.getElementById("deleteUsername").innerText = userName;
  showModal("deleteAccountModal");
}
// Function delete account
async function deleteAccount(e) {
  e.preventDefault();
  const accountId = document.getElementById("deleteAccountId").value;
  const response = await fetchWithAuth(`${apiUrl}/admin/${accountId}`, {
    method: "DELETE",
  });

  if (response.ok) {
    fetchAccounts();
    showToast("Success", "Delete account successfully!", "success");
    hideModal("deleteAccountModal");
  } else {
    showToast("Fail", "Delete account fail. Please try again!", "danger");
  }
}
// Open Modal to delete account
function openRestoreModal(accountId, userName) {
  console.log(accountId, userName);
  document.getElementById("restoreAccountId").value = accountId;
  document.getElementById("restoreUsername").innerText = userName;
  showModal("restoreAccountModal");
}
// Function delete account
async function restoreAccount(e) {
  e.preventDefault();
  const accountId = document.getElementById("restoreAccountId").value;
  const response = await fetchWithAuth(`${apiUrl}/admin/restore/${accountId}`, {
    method: "PUT",
  });

  if (response.ok) {
    fetchAccounts();
    showToast("Success", "Restore account successfully!", "success");
    hideModal("restoreAccountModal");
  } else {
    showToast("Fail", "Restore account fail. Please try again!", "danger");
  }
}
