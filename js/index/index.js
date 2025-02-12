document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "ws://localhost:3000";
  let currentPage = 1;
  let itemsPerPage = 10;
  let allData = [];

  const userName = localStorage.getItem("userName");
  if (userName) {
    connectWebSocket(userName, apiUrl, (data) => {
      let statusBas = "Unknown";
      if (data && data.payload) {
        updateDataList(data);
        if (data.payload.statusBas) {
          statusBas = data.payload.statusBas;
        } else {
          console.warn("Missing statusBas in payload, setting default.");
        }
      } else {
        console.warn("Invalid data received, skipping updateDataList.");
      }
      updateStatusOfBas(statusBas);
    });
  }

  const updateDataList = (data) => {
    console.log("Received:", data);
    const dataList = document.getElementById("data-now");
    dataList.innerHTML = "";
    const div = document.createElement("div");
    div.className = "data-item";
    const action = data.payload.action || "";
    if (action === "editData") {
      div.textContent = `${data.payload.message}, Date: ${
        data.payload.data.date || "N/A"
      }, Content: ${data.payload.data.content || "N/A"}, Status now: ${
        data.payload.data.statusData || "N/A"
      } `;
      dataList.appendChild(div);
    }
  };

  const updateStatusOfBas = (newMessage) => {
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = `<p><strong>BAS status:</strong> ${newMessage}</p>`;
  };

  const accountManager = () => {
    window.location.href = "account.html";
  };

  // Logout
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", (event) => {
      event.preventDefault();
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "login.html";
    });
  }

  // Event handler function opens Account page
  const accountButton = document.getElementById("Account-button");
  if (accountButton) {
    accountButton.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = "account.html";
    });
  }

  // Attach click event to buttons and forms
  const fetchDataButton = document.getElementById("fetch-data-button");
  if (fetchDataButton) {
    fetchDataButton.addEventListener("click", fetchData);
  }

  const addDataButton = document.getElementById("add-data-button");
  if (addDataButton) {
    addDataButton.addEventListener("click", addData);
  }

  const getListDataButton = document.getElementById("get-list-data-button");
  if (getListDataButton) {
    getListDataButton.addEventListener("click", getListData);
  }

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", () =>
      renderTable(currentPage, itemsPerPage, allData)
    );
  }

  const statusFilter = document.getElementById("status-filter");
  if (statusFilter) {
    statusFilter.addEventListener("change", () =>
      renderTable(currentPage, itemsPerPage, allData)
    );
  }

  const itemsPerPageSelect = document.getElementById("items-per-page");
  if (itemsPerPageSelect) {
    itemsPerPageSelect.addEventListener("change", () =>
      renderTable(currentPage, itemsPerPage, allData)
    );
  }

  const userManager = document.getElementById("user-manager");
  if (userManager) {
    userManager.addEventListener("click", accountManager);
  }
  const addListData = document.getElementById("add-list-data");
  if (addListData) {
    addListData.addEventListener("click", () => {
      $("#userManagementModal").modal("show");
    });
  }

  const submitListButton = document.getElementById("submit-list");
  if (submitListButton) {
    submitListButton.addEventListener("click", () => {
      getListData();
      $("#userManagementModal").modal("hide");
    });
  }

  // Check token when page is loaded
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
  } else {
    // Fetch data when page is loaded
    fetchData();
  }

  // WebSocket connection when page is loaded
  if (userName) {
    connectWebSocket(userName, apiUrl, (data) => {
      let statusBas = "Unknown";
      if (data && data.payload) {
        updateDataList(data);
        if (data.payload.statusBas) {
          statusBas = data.payload.statusBas;
        } else {
          console.warn("Missing statusBas in payload, setting default.");
        }
      } else {
        console.warn("Invalid data received, skipping updateDataList.");
      }
      updateStatusOfBas(statusBas);
    });
  }
});
