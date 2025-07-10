// REGISTER
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    fetch("https://kilimo-house-api.up.railway.app/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      if (data.success) {
        window.location.href = "login.html";
      }
    })
    .catch(err => {
      console.error("Registration failed", err);
      alert("Registration failed.");
    });
  });
}

// LOGIN
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const identifier = document.getElementById("loginIdentifier").value.trim();
    const password = document.getElementById("loginPassword").value;

    fetch("https://kilimo-house-api.up.railway.app/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ identifier, password }) // sending combined field
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      if (data.success) {
        localStorage.setItem("email", data.email || identifier);
        window.location.href = "dashboard.html";
      }
    })
    .catch(err => {
      console.error("Login failed", err);
      alert("Login failed.");
    });
  });
}

// LOGOUT
function logout() {
  localStorage.removeItem("email");
  window.location.href = "login.html";
}

// DASHBOARD + PROGRAMS VIEW
document.addEventListener("DOMContentLoaded", () => {
  const loggedInUser = localStorage.getItem("email");
  const adminEmail = "admin@kilimohouse.go.ke";

  // === Dashboard ===
  if (window.location.pathname.includes("dashboard.html")) {
    const farmerSection = document.getElementById("farmers-list");
    if (loggedInUser === adminEmail && farmerSection) {
      farmerSection.style.display = "block";
      fetch("https://kilimo-house-api.up.railway.app/farmers")
        .then(res => res.json())
        .then(users => {
          const tbody = document.getElementById("farmerTableBody");
          tbody.innerHTML = "";
          users.forEach((user, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
              <td>${index + 1}</td>
              <td>${user.email}</td>
              <td>${user.phone || '-'}</td>
              <td>••••••</td>
            `;
            tbody.appendChild(row);
          });
        });
    } else if (farmerSection) {
      farmerSection.style.display = "none";
    }
  }

  // === Programs Submission (admin only) ===
  if (window.location.pathname.includes("programs.html")) {
    if (loggedInUser === adminEmail) {
      const section = document.getElementById("submittedProgramsSection");
      const tableBody = document.getElementById("submittedProgramsTableBody");
      section.style.display = "block";

      fetch("https://kilimo-house-api.up.railway.app/all-programs")
        .then(res => res.json())
        .then(data => {
          tableBody.innerHTML = "";
          data.forEach(entry => {
            const row = document.createElement("tr");
            row.innerHTML = `
              <td style="padding: 10px; border: 1px solid #ccc;">${entry.name}</td>
              <td style="padding: 10px; border: 1px solid #ccc;">${entry.email}</td>
              <td style="padding: 10px; border: 1px solid #ccc;">${entry.program}</td>
              <td style="padding: 10px; border: 1px solid #ccc;">${entry.notes || '-'}</td>
              <td style="padding: 10px; border: 1px solid #ccc;">${new Date(entry.registeredAt).toLocaleString()}</td>
            `;
            tableBody.appendChild(row);
          });
        })
        .catch(err => console.error("Error loading program submissions:", err));
    }
  }
});

// === PROGRAM REGISTRATION FORM (All Users) ===
const programForm = document.getElementById("programForm");
if (programForm) {
  programForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      program: document.getElementById("program").value,
      notes: document.getElementById("notes").value.trim()
    };

    const res = await fetch("https://kilimo-house-api.up.railway.app/register-program", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    const msg = document.getElementById("responseMessage");
    msg.textContent = data.message;
    msg.style.color = data.success ? "green" : "red";

    if (data.success) {
      programForm.reset();
    }
  });
}
