const apiUrl = "https://localhost:3000";

document.getElementById("createForm").addEventListener("submit", addAccount);

// Function to refresh the access token
async function refreshToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    window.location.href = "index.html"; // Redirect to login page if refresh token is missing
    return null;
  }

  try {
    const response = await fetch(`${apiUrl}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.accessToken);
      return data.accessToken;
    } else {
      window.location.href = "index.html"; // Redirect to login page if refresh fails
      return null;
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
    window.location.href = "index.html";
    return null;
  }
}

// Function to fetch data with authentication and refresh token if needed
async function fetchWithAuth(url, options = {}) {
  let token = localStorage.getItem("token");
  // Append Authorization header
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  let response = await fetch(url, options);
  // If token expired, refresh token once
  if (response.status === 401) {
    token = await refreshToken();
    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
      response = await fetch(url, options);
    }
  }

  return response;
}

// Function to fetch all accounts
async function fetchAccounts() {
  const response = await fetchWithAuth(`${apiUrl}/admin`, {
    method: "GET",
  });

  if (response.ok) {
    const accounts = await response.json();
    displayAccounts(accounts);
  } else {
    if (response.status === 401) {
      alert("Access forbidden: You do not have the required permissions.");
    } else {
      alert("Failed to fetch accounts");
    }
  }
}

// Function to display accounts in the table
function displayAccounts(accounts) {
  console.log(accounts);
  const accountTableBody = document.getElementById("accountTableBody");
  accountTableBody.innerHTML = "";
  accounts.forEach((account) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${account.account_Id}</td>
            <td>${account.account_type}</td>
            <td>${account.userName}</td>
            <td>${account.isDeleted}</td>
            <td>
                <button onclick="editAccount(${account.account_Id})">Edit</button>
                <button onclick="deleteAccount(${account.account_Id})">Delete</button>
            </td>
        `;
    accountTableBody.appendChild(row);
  });
}

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
      document.getElementById("output").textContent = JSON.stringify(
        users,
        null,
        2
      );

      // Add each user account
      for (const user of users) {
        await addListAccount(user.userName, user.passWord);
      }
    },
    error: function (error) {
      console.error("Error reading CSV file:", error);
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
      throw new Error("Failed to create account");
    }
    console.log(`Account for ${username} created successfully.`);
  } catch (error) {
    console.error("Error creating account:", error);
    // alert(error.message || "An unexpected error occurred");
  }
}

// Function to log out
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  window.location.href = "index.html";
}

// Initial fetch of accounts
fetchAccounts();
