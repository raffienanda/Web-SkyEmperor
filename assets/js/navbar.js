// assets/js/navbar.js

document.addEventListener("DOMContentLoaded", () => {
  const navLogin = document.getElementById("nav-login");
  const session = localStorage.getItem("user_skyemperor");

  // Hanya jalankan jika user login dan elemen nav-login ditemukan
  if (session && navLogin) {
    const user = JSON.parse(session);
    const firstName = user.nama.split(" ")[0]; // Ambil nama depan

    // 1. Buat struktur HTML Dropdown baru
    // Kita mengganti <a>Login</a> menjadi <div> berisi Nama & Menu Logout
    const dropdownHTML = `
      <div class="user-dropdown">
        <span class="user-name">Hi, ${firstName} &#9662;</span>
        <div class="dropdown-content">
          <a href="#" id="btn-logout-action">Logout</a>
        </div>
      </div>
    `;

    // 2. Ganti elemen Login di navbar dengan Dropdown yang baru dibuat
    navLogin.outerHTML = dropdownHTML;

    // 3. Pasang Event Listener untuk tombol Logout yang baru
    const btnLogout = document.getElementById("btn-logout-action");
    if (btnLogout) {
      btnLogout.addEventListener("click", (e) => {
        e.preventDefault(); 
        
        const confirmLogout = confirm(`Halo ${user.nama}, yakin ingin Logout?`);
        if (confirmLogout) {
          localStorage.removeItem("user_skyemperor");
          window.location.href = "index.html"; 
        }
      });
    }
  }
});