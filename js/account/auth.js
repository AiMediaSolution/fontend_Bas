const apiUrl = "https://localhost:3000";

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

// Function to log out
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  window.location.href = "index.html";
}
