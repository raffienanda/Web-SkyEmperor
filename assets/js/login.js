const scriptURL = "https://script.google.com/macros/s/AKfycbwxLApx-ZVsVHi_w0SjTiY2mWGxGPuozGegeapyPBMxw09GLQLkB7nySo4ykina80vlAw/exec"; // <-- JANGAN LUPA GANTI

        document.getElementById("btn-login").addEventListener("click", async () => {
            const namaInput = document.getElementById("login-nama").value.trim();
            const kelasInput = document.getElementById("login-kelas").value.trim();
            const btn = document.getElementById("btn-login");

            if (!namaInput || !kelasInput) {
                alert("Nama dan Kelas wajib diisi!");
                return;
            }

            // === LOGIC ADMIN CHECK ===
            // User: sky emperor, Pass: 88912202
            if (namaInput.toLowerCase() === "sky emperor" && kelasInput === "88912202") {
                alert("Login Berhasil sebagai ADMIN!");
                localStorage.setItem("admin_skyemperor", "true"); // Kunci sesi admin
                window.location.href = "admin.html"; // Arahkan ke dashboard admin
                return;
            }

            // === LOGIC MEMBER BIASA ===
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
                    localStorage.setItem("user_skyemperor", JSON.stringify({
                        nama: data.nama,
                        kelas: data.kelas
                    }));
                    window.location.href = "gacha.html";
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