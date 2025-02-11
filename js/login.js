document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "http://localhost:3000";
  const login = async () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: username, passWord: password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("data", JSON.stringify(data));
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("userName", username);
        console.log("Token saved in login:", data);
        window.location.href = "index.html";
      } else {
        const errorData = await response.json();
        alert(`Login failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred during login. Please try again later.");
    }
  };

  document.getElementById("login-button").addEventListener("click", login);
});

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("token")) {
    window.location.href = "index.html";
  }
});
