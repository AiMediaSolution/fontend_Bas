let currentPage = 1;
let itemsPerPage = 10;
let allData = [];

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

const getListData = () => {
  const listContent = document.getElementById("list-content").value;
  const dataList = listContent.split("\n").filter((item) => item.trim() !== "");
  const formattedData = dataList
    .map((content) => ({
      content: content.trim(),
      status: "pending",
      date: new Date().toISOString(),
    }))
    .filter((data) => data.content);
  addMultiListData(formattedData);
};

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
