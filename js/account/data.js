let accountsData = []; // Store accounts data locally
let currentPage = 1;
let itemsPerPage = 10;

document.getElementById("items-per-page").addEventListener("change", () => {
  currentPage = 1;
  renderTable();
});

// Function to fetch all accounts
async function fetchAccounts() {
  const response = await fetchWithAuth(`${apiUrl}/admin`, {
    method: "GET",
  });

  if (response.ok) {
    accountsData = await response.json(); // Save data locally
    renderTable();
  } else {
    if (response.status === 401) {
      alert("Access forbidden: You do not have the required permissions.");
    } else {
      alert("Failed to fetch accounts");
    }
  }
}

// Function to search accounts by username
function searchAccounts() {
  const searchInput = document
    .getElementById("search-input")
    .value.toLowerCase();
  const filteredAccounts = accountsData.filter((account) =>
    account.userName.toLowerCase().includes(searchInput)
  );
  renderTable(filteredAccounts);
}

// Function to change page
function changePage(direction) {
  const totalPages = Math.ceil(accountsData.length / itemsPerPage);
  currentPage = Math.max(1, Math.min(currentPage + direction, totalPages));
  renderTable();
}

// Function to go to the first page
function goToFirstPage() {
  if (currentPage !== 1) {
    currentPage = 1;
    renderTable();
  }
}

// Function to go to the last page
function goToLastPage() {
  const totalPages = Math.ceil(accountsData.length / itemsPerPage);
  if (currentPage !== totalPages) {
    currentPage = totalPages;
    renderTable();
  }
}

// Function to render table with pagination and filtering
function renderTable(filteredAccounts = accountsData) {
  console.log(accountsData, "aa");
  const accountTableBody = document.getElementById("accountTableBody");
  const totalEntries = document.getElementById("total-entries");
  const firstPage = document.getElementById("first-page");
  const previousPage = document.getElementById("previous-page");
  const nextPage = document.getElementById("next-page");
  const lastPage = document.getElementById("last-page");
  const pageNumberInput = document.getElementById("page-number");

  itemsPerPage = parseInt(document.getElementById("items-per-page").value, 10);

  const totalItems = filteredAccounts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedAccounts = filteredAccounts.slice(startIndex, endIndex);

  accountTableBody.innerHTML = "";
  paginatedAccounts.forEach((account, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td>${account.account_Id}</td>
            <td>${account.account_type}</td>
            <td>${account.userName}</td>
            <td>${account.data}</td>
            <td>
                <button onclick="editAccount(${
                  account.account_Id
                })">Edit</button>
                <button onclick="deleteAccount(${
                  account.account_Id
                })">Delete</button>
            </td>
        `;
    accountTableBody.appendChild(row);
  });

  totalEntries.textContent = totalItems;
  firstPage.classList.toggle("disabled", currentPage === 1);
  previousPage.classList.toggle("disabled", currentPage === 1);
  nextPage.classList.toggle("disabled", currentPage === totalPages);
  lastPage.classList.toggle("disabled", currentPage === totalPages);

  firstPage.querySelector("a").style.pointerEvents =
    currentPage === 1 ? "none" : "auto";
  previousPage.querySelector("a").style.pointerEvents =
    currentPage === 1 ? "none" : "auto";
  nextPage.querySelector("a").style.pointerEvents =
    currentPage === totalPages ? "none" : "auto";
  lastPage.querySelector("a").style.pointerEvents =
    currentPage === totalPages ? "none" : "auto";

  pageNumberInput.value = currentPage;
  pageNumberInput.onchange = () => {
    const newPage = parseInt(pageNumberInput.value);
    if (newPage >= 1 && newPage <= totalPages) {
      currentPage = newPage;
      renderTable();
    } else {
      pageNumberInput.value = currentPage;
    }
  };
}

// Event listeners for pagination buttons
document.getElementById("first-page").addEventListener("click", goToFirstPage);
document
  .getElementById("previous-page")
  .addEventListener("click", () => changePage(-1));
document
  .getElementById("next-page")
  .addEventListener("click", () => changePage(1));
document.getElementById("last-page").addEventListener("click", goToLastPage);

// Initial fetch of accounts
fetchAccounts();
