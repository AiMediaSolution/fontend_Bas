// Function to create a new account
async function addAccount(e) {
  e.preventDefault();

  const accountType = document.getElementById("accountType").value;
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
      throw new Error("Failed to create account");
    }

    // Refresh account list and reset form
    await fetchAccounts();
    document.getElementById("createForm").reset();
  } catch (error) {
    console.error("Error creating account:", error);
    alert(error.message || "An unexpected error occurred");
  }
}

// Function to delete an account
async function deleteAccount(accountId) {
  const response = await fetchWithAuth(`${apiUrl}/admin/${accountId}`, {
    method: "DELETE",
  });

  if (response.ok) {
    fetchAccounts();
  } else {
    alert("Failed to delete account");
  }
}

// Function to edit an account
function editAccount(accountId) {
  document.getElementById("update-account").style.display = "block";

  const account = Array.from(
    document.getElementById("accountTableBody").children
  ).find((row) => row.children[0].textContent == accountId);

  document.getElementById("updateAccountId").value = accountId;
  document.getElementById("updateAccountType").value =
    account.children[1].textContent;
  document.getElementById("updateUsername").value =
    account.children[2].textContent;
}

// Function to update an account
document
  .getElementById("updateForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const accountId = document.getElementById("updateAccountId").value;
    const accountType = document.getElementById("updateAccountType").value;
    const username = document.getElementById("updateUsername").value;
    const password = document.getElementById("updatePassword").value;

    const response = await fetchWithAuth(`${apiUrl}/admin/${accountId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accountType, username, password }),
    });

    if (response.ok) {
      fetchAccounts();
      document.getElementById("updateForm").reset();
      document.getElementById("update-account").style.display = "none";
    } else {
      alert("Failed to update account");
    }
  });
