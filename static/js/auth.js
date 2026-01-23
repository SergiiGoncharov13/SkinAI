// ================= MOCK AUTH =================

const MOCK_USER = {
  email: "demo@skinai.app",
  name: "Demo User",
};

// ===== LOGIN =====
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      // 🔐 MOCK CHECK
      if (email === MOCK_USER.email && password.length > 0) {
        // зберігаємо сесію
        localStorage.setItem("skinai_user", JSON.stringify(MOCK_USER));

        // редірект
        window.location.href = "/dashboard";
      } else {
        showAuthError("Невірний email або пароль");
      }
    });
  }
});

// ===== LOGOUT =====
function logout() {
  localStorage.removeItem("skinai_user");
  window.location.href = "/login";
}

// ===== PROTECT DASHBOARD =====
function requireAuth() {
  const user = localStorage.getItem("skinai_user");

  if (!user) {
    window.location.href = "/login";
  }
}

// ===== ERROR UI =====
function showAuthError(message) {
  let error = document.querySelector(".auth-error");

  if (!error) {
    error = document.createElement("div");
    error.className = "auth-error";
    error.style.color = "#dc2626";
    error.style.marginTop = "12px";
    error.style.fontSize = "0.9rem";

    const form = document.querySelector("form");
    form.appendChild(error);
  }

  error.textContent = message;
}
