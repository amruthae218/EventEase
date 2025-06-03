document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 login.js loaded");

  const loginForm = document.getElementById("login-form");
  const toggleBtn = document.getElementById("toggleBtn");
  const toggleText = document.getElementById("toggleText");
  const formTitle = document.getElementById("formTitle");
  const submitText = document.getElementById("submitText");

  const fullNameField = document.getElementById("fullNameField");
  const roleField = document.getElementById("roleField");

  let isLoginMode = true;

  // 🔁 Toggle login/signup mode
  toggleBtn.addEventListener("click", () => {
    isLoginMode = !isLoginMode;

    if (isLoginMode) {
      formTitle.textContent = "Login";
      submitText.textContent = "Login";
      toggleText.textContent = "Don't have an account?";
      toggleBtn.textContent = "Sign up";

      fullNameField.classList.add("hidden");
      roleField.classList.add("hidden");
    } else {
      formTitle.textContent = "Sign Up";
      submitText.textContent = "Sign Up";
      toggleText.textContent = "Already have an account?";
      toggleBtn.textContent = "Login";

      fullNameField.classList.remove("hidden");
      roleField.classList.remove("hidden");
    }
  });

  // 🔐 Form submit handler
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    if (isLoginMode) {
      // 🚪 LOGIN
      try {
        const tokenResponse = await fetch("http://localhost:8000/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            username: email,
            password: password,
          }),
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          alert(errorData.detail || "Login failed");
          return;
        }

        const tokenData = await tokenResponse.json();
        const token = tokenData.access_token;

        const userResponse = await fetch("http://localhost:8000/users/me/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) {
          alert("Failed to fetch user info");
          return;
        }

        const user = await userResponse.json();

        localStorage.setItem("access_token", token);
        localStorage.setItem("user", JSON.stringify(user));

        const role = user.role.toLowerCase();
        if (role === "participant") {
          window.location.href = "participant_dashboard.html";
        } else if (role === "club_rep" || role === "faculty") {
          window.location.href = "organizer_dashboard.html";
        } else {
          alert("Unknown user role");
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("An error occurred during login");
      }
    } else {
      // ✍️ SIGNUP
      const fullName = document.getElementById("full_name").value.trim();
      const role = document.getElementById("role").value;

      if (!fullName || !role) {
        alert("Please fill out all signup fields.");
        return;
      }

      try {
        const res = await fetch("http://localhost:8000/users/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: fullName,
            email: email,
            password: password,
            role: role,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.detail || "Signup failed");
          return;
        }

        alert("Signup successful! You can now login.");
        toggleBtn.click(); // Switch to login mode
      } catch (err) {
        console.error("Signup error:", err);
        alert("An error occurred during signup");
      }
    }
  });
});
