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
