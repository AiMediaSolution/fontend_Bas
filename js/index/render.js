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
  const currentEntriesSelect = document.getElementById("current-entries");
  const firstPage = document.getElementById("first-page");
  const previousPage = document.getElementById("previous-page");
  const nextPage = document.getElementById("next-page");
  const lastPage = document.getElementById("last-page");
  const pageNumberInput = document.getElementById("page-number");
  const searchInput = document
    .getElementById("search-input")
    .value.toLowerCase();
  const statusFilter = document.getElementById("status-filter").value;
  itemsPerPage = parseInt(document.getElementById("items-per-page").value, 10);

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
  currentEntriesSelect.innerHTML = ""; // Clear current entries select options

  // Update current entries select options
  for (let i = 1; i <= paginatedData.length; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    currentEntriesSelect.appendChild(option);
  }

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
