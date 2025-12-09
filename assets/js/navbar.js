// assets/js/navbar.js

document.addEventListener("DOMContentLoaded", () => {
  const navLogin = document.getElementById("nav-login");
  const session = localStorage.getItem("user_skyemperor");

  if (session && navLogin) {
    // 1. Ambil data user dari penyimpanan
    const user = JSON.parse(session);
    
    // 2. Ubah Teks "Login" jadi Nama User (Panggil nama depan saja biar muat)
    const firstName = user.nama.split(" ")[0]; 
    navLogin.textContent = `Hi, ${firstName}`;
    
    // 3. Opsional: Ubah link agar tidak ke halaman login lagi
    navLogin.href = "#"; 
    
    // 4. Fitur Tambahan: Klik nama untuk Logout
    navLogin.addEventListener("click", (e) => {
      e.preventDefault(); // Cegah pindah halaman
      
      const confirmLogout = confirm(`Halo ${user.nama}, apakah kamu ingin Logout?`);
      if (confirmLogout) {
        localStorage.removeItem("user_skyemperor"); // Hapus sesi
        window.location.href = "index.html"; // Balik ke home
        // Script akan otomatis mereset navbar karena halaman reload
      }
    });
  }
});