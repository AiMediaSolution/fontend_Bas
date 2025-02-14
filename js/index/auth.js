const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    window.location.href = "login.html";
    return null;
  }

  try {
    const response = await fetch("https://localhost:3000/auth/refresh-token", {
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
