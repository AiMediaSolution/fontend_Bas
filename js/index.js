document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "ws://localhost:3000";
  let ws;
  let currentPage = 1;
  let itemsPerPage = 10;
  let allData = [];

  function connectWebSocket(userName) {
    ws = new WebSocket(apiUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server.");
      const joinRoomMessage = JSON.stringify({ type: "join", room: userName });
      ws.send(joinRoomMessage);
      console.log(`Sent join room request for room: ${userName}`);
      const fetchCurrentDataMessage = JSON.stringify({
        type: "fetch_current_data",
      });
      ws.send(fetchCurrentDataMessage);
      console.log("Sent request to fetch current data.");
    };

    ws.onmessage = (event) => {
      try {
        console.log("Received:", event.data);
        const data = JSON.parse(event.data);
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
      } catch (err) {
        console.error("Error processing message:", err);
      }
    };

    ws.onclose = () => {
      console.log(
        "Disconnected from WebSocket server. Reconnecting in 5 seconds..."
      );
      setTimeout(() => connectWebSocket(userName), 5000);
    };
    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };
  }

  function updateDataList(data) {
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
  }

  function updateStatusOfBas(newMessage) {
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = `<p><strong>BAS status:</strong> ${newMessage}</p>`;
  }

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

  // refresh token
  const refreshToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      window.location.href = "login.html";
      return null;
    }

    try {
      const response = await fetch("http://localhost:3000/auth/refresh-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.accessToken);
        return data.accessToken;
      } else {
        window.location.href = "login.html";
        return null;
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      window.location.href = "login.html";
      return null;
    }
  };

  // Fetch data with authentication
  const fetchWithAuth = async (url, options = {}) => {
    let token = localStorage.getItem("token");
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    let response = await fetch(url, options);

    if (response.status === 401) {
      token = await refreshToken();
      if (token) {
        options.headers.Authorization = `Bearer ${token}`;
        response = await fetch(url, options);
      }
    }

    return response;
  };

  // add new data by user
  const addData = async () => {
    const content = document.getElementById("content").value;
    try {
      const response = await fetchWithAuth("http://localhost:3000/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          status: "processing",
          date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        alert("Data added successfully");
        document.getElementById("content").value = "";
        fetchData(); // Fetch data after adding new data
      } else {
        const errorData = await response.json();
        alert(`Failed to add data: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error adding data:", error);
      alert("An error occurred while adding data. Please try again later.");
    }
  };

  // Get list of data from input list
  const getListData = () => {
    const listContent = document.getElementById("list-content").value;
    const dataList = listContent
      .split("\n")
      .filter((item) => item.trim() !== "");
    const formattedData = dataList
      .map((content) => ({
        content: content.trim(),
        status: "pending",
        date: new Date().toISOString(),
      }))
      .filter((data) => data.content);
    addMultiListData(formattedData);
  };

  // Add multi data
  const addMultiListData = async (dataList) => {
    const userName = localStorage.getItem("userName");
    try {
      const response = await fetchWithAuth("http://localhost:3000/data/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: dataList, userName: userName }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("All data added successfully:", result);
        fetchData(); // Fetch data after adding multiple data
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add multiple data");
      }
    } catch (error) {
      console.error("Error adding multiple data:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // Get all data by user role
  const fetchData = async () => {
    try {
      const response = await fetchWithAuth("http://localhost:3000/data", {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        allData = data; // Save the data to the global variable
        renderTable();
      } else {
        alert("Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("An error occurred while fetching data. Please try again later.");
    }
  };

  // Render table with pagination and filtering
  const renderTable = () => {
    //formatter date to Viet Nam
    const formatter = new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh",
    });
    const dataList = document.getElementById("data-list");
    const totalEntries = document.getElementById("total-entries");
    const firstPage = document.getElementById("first-page");
    const previousPage = document.getElementById("previous-page");
    const nextPage = document.getElementById("next-page");
    const lastPage = document.getElementById("last-page");
    const pageNumberInput = document.getElementById("page-number");
    const searchInput = document
      .getElementById("search-input")
      .value.toLowerCase();
    const statusFilter = document.getElementById("status-filter").value;
    itemsPerPage = parseInt(
      document.getElementById("items-per-page").value,
      10
    );

    const filteredData = allData.filter((item) => {
      return (
        item.content.toLowerCase().includes(searchInput) &&
        (statusFilter === "" || item.status === statusFilter)
      );
    });

    const totalItems = filteredData.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedData = filteredData.slice(startIndex, endIndex);
    dataList.innerHTML = "";
    paginatedData.forEach((item, index) => {
      const tr = document.createElement("tr");
      const statusClasses = {
        done: "text-success",
        doing: "text-primary",
        pending: "text-info",
        fail: "text-danger",
      };

      const statusDot = `<td><span class="status ${
        statusClasses[item.status] || "text-secondary"
      }">&bull;</span> ${item.status}</td>`;
      let displayAction = "";
      if (item.status === "fail") {
        displayAction = `<a href="#" class="settings" title="Resend" data-toggle="tooltip">
                  <span class="material-symbols-outlined">refresh</span>
                  </a>`;
      } else {
        displayAction = "";
      }
      const dateObject = new Date(item.date);
      tr.innerHTML = `
              <td>${startIndex + index + 1}</td>
              <td>${item.content}</td>
              <td>${formatter.format(dateObject)}</td>
              ${statusDot}
              <td>
                  ${displayAction}
                </td>
          `;
      dataList.appendChild(tr);
    });
    totalEntries.textContent = totalItems;
    firstPage.classList.toggle("disabled", currentPage === 1);
    previousPage.classList.toggle("disabled", currentPage === 1);
    nextPage.classList.toggle("disabled", endIndex >= totalItems);
    lastPage.classList.toggle("disabled", endIndex >= totalItems);

    firstPage.onclick = () => {
      if (currentPage > 1) {
        currentPage = 1;
        pageNumberInput.value = currentPage;
        renderTable();
      }
    };

    previousPage.onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        pageNumberInput.value = currentPage;
        renderTable();
      }
    };

    nextPage.onclick = () => {
      if (endIndex < totalItems) {
        currentPage++;
        pageNumberInput.value = currentPage;
        renderTable();
      }
    };

    lastPage.onclick = () => {
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      if (currentPage < totalPages) {
        currentPage = totalPages;
        pageNumberInput.value = currentPage;
        renderTable();
      }
    };

    pageNumberInput.onchange = () => {
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      let newPage = parseInt(pageNumberInput.value, 10);
      if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderTable();
      } else {
        pageNumberInput.value = currentPage;
      }
    };
  };
  function accountManager() {
    window.location.href = "account.html";
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
    searchInput.addEventListener("input", renderTable);
  }

  const statusFilter = document.getElementById("status-filter");
  if (statusFilter) {
    statusFilter.addEventListener("change", renderTable);
  }

  const itemsPerPageSelect = document.getElementById("items-per-page");
  if (itemsPerPageSelect) {
    itemsPerPageSelect.addEventListener("change", renderTable);
  }
  const userManager = document.getElementById("user-manager");
  if (userManager) {
    userManager.addEventListener("click", accountManager);
  }
  // Check token when page is loaded
  const token = localStorage.getItem("token");
  console.log("Token on load:", token);
  if (!token) {
    window.location.href = "login.html";
  } else {
    // Fetch data when page is loaded
    fetchData();
  }

  // WebSocket connection when page is loaded
  const userName = localStorage.getItem("userName");
  if (userName) {
    connectWebSocket(userName);
  }
});
