const scriptURL = "https://script.google.com/macros/s/AKfycbzXifCyzfJz0ad9du6CmXwS_5qBsgxmbW9wQQVpVfvvMtRVn0dHRLEqes2d0xP1ttTXsA/exec";

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
            const userRole = (data.role || "Member").trim();

            localStorage.setItem("user_skyemperor", JSON.stringify({
                nama: data.nama,
                kelas: data.kelas,
                role: userRole
            }));

            const cekRole = userRole.toLowerCase();

            if (cekRole === "admin" || cekRole === "operator") {
                window.location.href = "admin.html"; 
            } else {
                window.location.href = "gacha.html"; 
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

const togglePassword = document.getElementById("toggle-password");
const kelasInput = document.getElementById("login-kelas");

if (togglePassword && kelasInput) {
    togglePassword.addEventListener("click", function () {
        const isPassword = kelasInput.getAttribute("type") === "password";
        
        kelasInput.setAttribute("type", isPassword ? "text" : "password");
        
        if (isPassword) {
            this.classList.remove("fa-eye-slash");
            this.classList.add("fa-eye");
            this.style.color = "#0284c7"; 
        } else {
            this.classList.remove("fa-eye");
            this.classList.add("fa-eye-slash");
            this.style.color = "#888"; 
        }
    });
}