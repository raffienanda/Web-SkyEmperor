const scriptURL = "https://script.google.com/macros/s/AKfycbzXifCyzfJz0ad9du6CmXwS_5qBsgxmbW9wQQVpVfvvMtRVn0dHRLEqes2d0xP1ttTXsA/exec"; // <-- Pastikan URL ini benar

document.getElementById("btn-login").addEventListener("click", async () => {
    const namaInput = document.getElementById("login-nama").value.trim();
    const kelasInput = document.getElementById("login-kelas").value.trim();
    const btn = document.getElementById("btn-login");

    if (!namaInput || !kelasInput) {
        alert("Nama dan Kelas wajib diisi!");
        return;
    }

    btn.textContent = "Checking...";
    btn.disabled = true;

    const formData = new FormData();
    formData.append("action", "login");
    formData.append("nama", namaInput);
    formData.append("kelas", kelasInput);

    try {
        const res = await fetch(scriptURL, { method: "POST", body: formData });
        const data = await res.json();

        if (data.status === "success") {
            // Ambil role dari database, pastikan formatnya aman (hilangkan spasi ekstra)
            const userRole = (data.role || "Member").trim();

            // Simpan data sesi ke LocalStorage
            localStorage.setItem("user_skyemperor", JSON.stringify({
                nama: data.nama,
                kelas: data.kelas,
                role: userRole
            }));

            // PENGATURAN REDIRECT (Ubah ke huruf kecil semua biar aman)
            const cekRole = userRole.toLowerCase();

            if (cekRole === "admin" || cekRole === "operator") {
                window.location.href = "admin.html"; // Admin & Operator ke dashboard
            } else {
                window.location.href = "gacha.html"; // Member biasa ke gacha
            }

        } else {
            alert("Login Gagal: " + data.message);
        }
    } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan koneksi.");
    } finally {
        btn.textContent = "Masuk";
        btn.disabled = false;
    }
});

// === FITUR HIDE/SHOW PASSWORD (KELAS) ===
const togglePassword = document.getElementById("toggle-password");
const kelasInput = document.getElementById("login-kelas");

if (togglePassword && kelasInput) {
    togglePassword.addEventListener("click", function () {
        // Cek tipe saat ini (apakah sedang password/tersembunyi?)
        const isPassword = kelasInput.getAttribute("type") === "password";
        
        // Jika iya, ubah jadi text. Jika tidak, kembalikan ke password.
        kelasInput.setAttribute("type", isPassword ? "text" : "password");
        
        // Ubah icon mata dan warnanya
        if (isPassword) {
            // Saat password DIBUKA (menjadi text) -> Icon Mata Terbuka (Biru)
            this.classList.remove("fa-eye-slash");
            this.classList.add("fa-eye");
            this.style.color = "#0284c7"; 
        } else {
            // Saat password DITUTUP (menjadi password) -> Icon Mata Tercoret (Abu-abu)
            this.classList.remove("fa-eye");
            this.classList.add("fa-eye-slash");
            this.style.color = "#888"; 
        }
    });
}