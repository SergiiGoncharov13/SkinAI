// auth.js - login & registration (mock)

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Mock credentials for demo
    if (email === 'test@gmail.com' && password === 'qwerty123') {
      localStorage.setItem('loggedInUser', email);
      // redirect to dashboard (same directory)
      window.location.href = 'dashboard.html';
    } else {
      alert('Invalid email or password');
    }
  });
}

// Register (mock)
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const age = document.getElementById('age').value;
    const email = document.getElementById('regEmail').value.trim();
    // simple mock: store email in localStorage so user can login easily (optional)
    localStorage.setItem('registeredUser', JSON.stringify({firstName, lastName, age, email}));
    alert(`Registered user: ${firstName} ${lastName}, Age: ${age}, Email: ${email}`);
    registerForm.reset();
  });
}

// Dashboard user email binding
document.addEventListener('DOMContentLoaded', () => {
  const userEmailElem = document.getElementById('userEmail');
  if (userEmailElem) {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      userEmailElem.textContent = loggedInUser;
    } else {
      // not logged in -> redirect to login
      window.location.href = 'login.html';
    }
  }
});
