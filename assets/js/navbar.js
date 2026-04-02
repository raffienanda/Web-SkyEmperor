
document.addEventListener("DOMContentLoaded", () => {
  const navLogin = document.getElementById("nav-login");
  const session = localStorage.getItem("user_skyemperor");

  if (session && navLogin) {
    const user = JSON.parse(session);
    const firstName = user.nama.split(" ")[0]; // Ambil nama depan

    const dropdownHTML = `
      <div class="user-dropdown">
        <span class="user-name">Hi, ${firstName} &#9662;</span>
        <div class="dropdown-content">
          <a href="#" id="btn-logout-action">Logout</a>
        </div>
      </div>
    `;

    navLogin.outerHTML = dropdownHTML;

    const btnLogout = document.getElementById("btn-logout-action");
    if (btnLogout) {
      btnLogout.addEventListener("click", (e) => {
        e.preventDefault();

        const confirmLogout = confirm(`Halo ${user.nama}, yakin ingin Logout?`);
        if (confirmLogout) {
          localStorage.removeItem("user_skyemperor");
          window.location.href = "login.html";
        }
      });
    }
  }
});