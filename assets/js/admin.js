const scriptURL = "https://script.google.com/macros/s/AKfycbwxLApx-ZVsVHi_w0SjTiY2mWGxGPuozGegeapyPBMxw09GLQLkB7nySo4ykina80vlAw/exec"; // <-- GANTI INI

        // 1. CEK APAKAH BENAR ADMIN
        if (!localStorage.getItem("admin_skyemperor")) {
            alert("Akses Ditolak! Anda bukan Admin.");
            window.location.href = "login.html";
        }

        // 2. LOAD DATA SAAT WEB DIBUKA
        window.addEventListener("DOMContentLoaded", loadAllData);

        async function loadAllData() {
            try {
                const res = await fetch(scriptURL + "?action=getAllData");
                const data = await res.json();

                renderMembers(data.members);
                renderPrizes(data.prizes);
                renderLogs(data.logs);
            } catch (err) {
                console.error(err);
                alert("Gagal mengambil data database.");
            }
        }

        // --- RENDER TABLE MEMBERS ---
        function renderMembers(data) {
            const tbody = document.querySelector("#table-members tbody");
            tbody.innerHTML = "";
            data.forEach(row => {
                // Row[0] = Nama, Row[1] = Kelas
                tbody.innerHTML += `
          <tr>
            <td>${row[0]}</td>
            <td><span class="badge-class">${row[1]}</span></td>
            <td><button class="btn-delete" onclick="deleteMember('${row[0]}')">Hapus</button></td>
          </tr>`;
            });
        }

        // --- RENDER TABLE PRIZES ---
        function renderPrizes(data) {
            const tbody = document.querySelector("#table-prizes tbody");
            tbody.innerHTML = "";
            data.forEach(row => {
                // Row[0] = Prize, Row[1] = Stock
                tbody.innerHTML += `
          <tr>
            <td>${row[0]}</td>
            <td style="font-weight:bold; color: ${row[1] > 0 ? '#4caf50' : '#f44336'};">${row[1]}</td>
          </tr>`;
            });
        }

        // --- RENDER TABLE LOGS ---
        function renderLogs(data) {
            const tbody = document.querySelector("#table-logs tbody");
            tbody.innerHTML = "";
            // Row[0]=Time, [1]=Nama, [2]=Kelas, [3]=Prize
            // Balik urutan biar yang terbaru di atas
            const reversed = data.slice().reverse();

            reversed.forEach(row => {
                let dateObj = new Date(row[0]);
                let timeString = isNaN(dateObj) ? row[0] : dateObj.toLocaleString(); // Handle format tanggal

                tbody.innerHTML += `
          <tr>
            <td style="font-size:12px;">${timeString}</td>
            <td>${row[1]}</td>
            <td>${row[2]}</td>
            <td style="color:#ffd700; font-weight:bold;">${row[3]}</td>
          </tr>`;
            });
        }

        // --- FUNGSI TOMBOL ---

        async function addMember() {
            const nama = document.getElementById("new-member-name").value;
            const kelas = document.getElementById("new-member-class").value;
            if (!nama || !kelas) return alert("Lengkapi data!");

            if (confirm("Tambah member ini?")) {
                const fd = new FormData();
                fd.append("action", "addMember");
                fd.append("nama", nama);
                fd.append("kelas", kelas);
                await fetch(scriptURL, { method: "POST", body: fd });
                location.reload();
            }
        }

        async function deleteMember(nama) {
            if (confirm(`Yakin hapus member: ${nama}?`)) {
                const fd = new FormData();
                fd.append("action", "deleteMember");
                fd.append("nama", nama);
                await fetch(scriptURL, { method: "POST", body: fd });
                location.reload();
            }
        }

        async function updateStock() {
            const item = document.getElementById("prize-item").value;
            const stock = document.getElementById("prize-stock").value;
            if (!item || !stock) return alert("Lengkapi data!");

            const fd = new FormData();
            fd.append("action", "updateStock");
            fd.append("item", item);
            fd.append("stock", stock);
            await fetch(scriptURL, { method: "POST", body: fd });
            location.reload();
        }

        // --- UTILS ---
        function switchTab(tabName) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
            document.getElementById('tab-' + tabName).classList.add('active');
            event.target.classList.add('active');
        }

        function logoutAdmin() {
            localStorage.removeItem("admin_skyemperor");
            window.location.href = "index.html";
        }