// assets/js/admin.js
const scriptURL = "https://script.google.com/macros/s/AKfycbzStOR2jCHZEmHhQIWqePA_Nzy19NAgaMHnnHQInIolzJf2Fr9JzOH1Es4-NspAEzGefg/exec"; 

// === GLOBAL VARIABLES ===
let globalMembers = [];
let globalLogs = []; 

// === 1. CEK SESSION DAN ROLE (KEAMANAN) ===
const sessionString = localStorage.getItem("user_skyemperor");

if (!sessionString) {
    alert("Akses Ditolak! Silakan login terlebih dahulu.");
    window.location.href = "login.html";
}

const userSession = JSON.parse(sessionString);
// Normalisasi role agar huruf kecil dan bersih dari spasi
const userRole = (userSession.role || "Member").trim().toLowerCase();

// Kalau yang nyasar ke admin.html adalah Member biasa
if (userRole === "member" || userRole === "") {
    alert("Akses Ditolak! Halaman ini khusus Admin dan Operator.");
    window.location.href = "gacha.html";
}

// === 2. ATUR TAMPILAN BERDASARKAN ROLE SAAT HALAMAN DIBUKA ===
window.addEventListener("DOMContentLoaded", () => {
    
    // JIKA DIA OPERATOR, BATASI AKSESNYA
    if (userRole === "operator") {
        // Cari tombol-tombol navigasi di sidebar kiri
        const navItems = document.querySelectorAll(".sidebar-nav .nav-item");
        
        if (navItems.length >= 3) {
            navItems[0].style.display = "none"; // Sembunyikan menu Member
            navItems[1].style.display = "none"; // Sembunyikan menu Prize
            
            // Pindahkan tab aktif secara paksa ke tab History (Logs)
            switchTab('logs', navItems[2]); 
        }
    }

    // Load data dari database
    loadAllData();
});

// 2. LOAD DATA SAAT WEB DIBUKA
window.addEventListener("DOMContentLoaded", loadAllData);

// === EVENT LISTENER SEARCH (Fitur Baru) ===
const searchInput = document.getElementById("search-member");
if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
        const keyword = e.target.value.toLowerCase();
        
        const filteredMembers = globalMembers.filter(row => {
            const nama = (row[0] || "").toString().toLowerCase();
            const kelas = (row[1] || "").toString().toLowerCase();
            const role = (row[2] || "").toString().toLowerCase(); // Ambil dari kolom C
            return nama.includes(keyword) || kelas.includes(keyword) || role.includes(keyword);
        });
        renderMembers(filteredMembers);
    });
}

async function loadAllData() {
    try {
        const res = await fetch(scriptURL + "?action=getAllData");
        const data = await res.json();

        globalMembers = data.members;
        globalLogs = data.logs; 

        renderMembers(data.members);
        renderPrizes(data.prizes);
        renderLogs(data.logs);
        
        // TAMBAHKAN BARIS INI:
        renderDashboard(); 
        
    } catch (err) {
        console.error(err);
        alert("Gagal mengambil data database.");
    }
}

// --- RENDER TABLE MEMBERS ---
function renderMembers(data) {
    const tbody = document.querySelector("#table-members tbody");
    tbody.innerHTML = "";
    
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Tidak ada data ditemukan.</td></tr>`;
        return;
    }

    data.forEach(row => {
        let role = row[2] ? row[2] : "Member"; 
        let roleColor = role === "Admin" ? "color: #dc2626; font-weight: bold;" : 
                        (role === "Operator" ? "color: #0284c7; font-weight: bold;" : "color: #666;");
        
        // AMBIL DATA JATAH SPIN (Kolom D / row[3])
        let count = row[3] ? row[3] : 0;

        tbody.innerHTML += `
            <tr>
            <td style="color: #333; font-weight: 600;">${row[0]}</td>
            <td>${row[1]}</td>
            <td style="${roleColor}">${role}</td>
            <td style="font-weight: 800; color: #10b981;">${count}x</td>
            <td>
                <button class="btn-action-pill pill-delete" onclick="deleteMember('${row[0]}')">DELETE</button>
                <button class="btn-action-pill pill-edit" onclick="openEditModal('${row[0]}', '${row[1]}', '${role}', '${count}')">EDIT</button>
            </td>
            </tr>`;
    });
}

// --- RENDER TABLE PRIZES ---
function renderPrizes(data) {
    const tbody = document.querySelector("#table-prizes tbody");
    tbody.innerHTML = "";
    data.forEach(row => {
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
    const reversed = data.slice().reverse();
    
    // Ambil daftar log yang sudah pernah di-print
    const printedLogs = getPrintedLogs();

    reversed.forEach(row => {
        let dateObj = new Date(row[0]);
        let timeString = isNaN(dateObj) ? row[0] : dateObj.toLocaleString();

        let safeTime = timeString.replace(/'/g, "\\'");
        let safeName = row[1].toString().replace(/'/g, "\\'");
        let safeClass = row[2].toString().replace(/'/g, "\\'");
        let safePrize = row[3].toString().replace(/'/g, "\\'");

        // Buat ID Unik untuk membedakan tiap baris (Gabungan Waktu & Nama)
        // btoa() digunakan untuk mengubah teks menjadi kode base64 agar aman tanpa spasi
        let logId = btoa(safeTime + safeName); 
        
        // Cek apakah ID ini sudah ada di daftar print
        let isPrinted = printedLogs.includes(logId);

        // Ubah warna dan teks tombol jika sudah di-print
        let btnStyle = isPrinted 
            ? "background-color: #f3f4f6; color: #9ca3af; border-color: #d1d5db;" // Warna Abu-abu
            : "background-color: #e0f2fe; color: #0284c7; border-color: #7dd3fc;"; // Warna Biru
            
        let btnText = isPrinted 
            ? '<i class="fa-solid fa-check-double"></i> PRINTED' 
            : '<i class="fa-solid fa-print"></i> PRINT';

        tbody.innerHTML += `
            <tr>
            <td style="font-size:12px;">${timeString}</td>
            <td>${row[1]}</td>
            <td>${row[2]}</td>
            <td style="color:#d97706; font-weight:800;">${row[3]}</td>
            <td>
                <button class="btn-action-pill" style="${btnStyle}" 
                onclick="printStruk('${safeTime}', '${safeName}', '${safeClass}', '${safePrize}', '${logId}')">
                    ${btnText}
                </button>
            </td>
            </tr>`;
    });
}

// --- FUNGSI TOMBOL (Add, Delete, Update) Tetap Sama ---

async function addMember() {
    const nama = document.getElementById("new-member-name").value;
    const kelas = document.getElementById("new-member-class").value;
    const role = document.getElementById("new-member-role").value; 
    const count = document.getElementById("new-member-count").value; // AMBIL COUNT
    
    if (!nama || !kelas || !role) return alert("Lengkapi data!");

    if (confirm("Tambah member ini?")) {
        const btn = document.querySelector("#add-modal .btn-save");
        if(btn) { btn.textContent = "Menyimpan..."; btn.disabled = true; }

        const fd = new FormData();
        fd.append("action", "addMember");
        fd.append("nama", nama);
        fd.append("kelas", kelas);
        fd.append("role", role); 
        fd.append("count", count); // KIRIM COUNT KE SERVER

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
function switchTab(tabName, element) {
    // Sembunyikan semua konten tab
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    // Tampilkan tab yang dipilih
    document.getElementById('tab-' + tabName).classList.add('active');
    
    // Hapus class active dari semua tombol di sidebar
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    // Tambahkan class active ke tombol yang diklik
    if(element) {
        element.classList.add('active');
    }
}
function logoutAdmin() {
    if(confirm("Yakin ingin log out?")) {
        // Hapus sesi utama
        localStorage.removeItem("user_skyemperor");
        window.location.href = "login.html";
    }
}

// Buka Modal & Isi Data Lama
function openEditModal(name, kelas) {
    const modal = document.getElementById("edit-modal");
    
    // Isi form dengan data saat ini
    document.getElementById("edit-old-name").value = name; // Simpan nama lama sbg kunci
    document.getElementById("edit-name").value = name;
    document.getElementById("edit-class").value = kelas;
    
    // Tampilkan modal
    modal.style.display = "block";
}

// Tutup Modal
function closeEditModal() {
    document.getElementById("edit-modal").style.display = "none";
}

// Simpan Perubahan ke Server
async function saveEditMember() {
    const oldName = document.getElementById("edit-old-name").value;
    const newName = document.getElementById("edit-name").value;
    const newClass = document.getElementById("edit-class").value;
    const newRole = document.getElementById("edit-role").value; 
    const newCount = document.getElementById("edit-count").value; // AMBIL JATAH BARU
    
    if (!newName || !newClass) return alert("Data tidak boleh kosong!");

    const btn = document.querySelector("#edit-modal .btn-save");
    btn.textContent = "Menyimpan...";
    btn.disabled = true;

    try {
        const fd = new FormData();
        fd.append("action", "editMember");
        fd.append("oldName", oldName);
        fd.append("newName", newName);
        fd.append("newClass", newClass);
        fd.append("newRole", newRole); 
        fd.append("newCount", newCount); // KIRIM KE SERVER

        await fetch(scriptURL, { method: "POST", body: fd });
        
        alert("Data Berhasil Diupdate!");
        location.reload(); 
    } catch (err) {
        console.error(err);
        alert("Gagal mengupdate data.");
        btn.textContent = "Simpan Perubahan";
        btn.disabled = false;
    }
}

function openAddModal() {
    document.getElementById("add-modal").style.display = "block";
}

function closeAddModal() {
    document.getElementById("add-modal").style.display = "none";
}

// === FUNGSI PRINT STRUK KASIR (THERMAL 58mm) ===
function printStruk(waktu, nama, kelas, prize, logId) {
    
    // 1. Cek apakah sudah pernah diprint
    let printedLogs = getPrintedLogs();
    if (printedLogs.includes(logId)) {
        if (!confirm("Struk ini sudah pernah dicetak!\nApakah kamu yakin ingin mencetak ulang (Reprint)?")) {
            return;
        }
    }

    // 2. Format HTML Struk (Dioptimalkan untuk Thermal Printer)
    const strukHTML = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <title>Print Struk</title>
            <style>
                /* Menghilangkan margin browser bawaan saat print */
                @page { margin: 0; }
                
                /* Setting kertas thermal 58mm */
                body {
                    font-family: 'Courier New', Courier, monospace; /* Font khas kasir */
                    width: 58mm; 
                    margin: 0;
                    padding: 5mm; /* Jarak aman dari pinggir kertas */
                    color: #000;
                    font-size: 12px;
                    line-height: 1.4;
                    box-sizing: border-box;
                }
                
                .center { text-align: center; }
                .left { text-align: left; }
                
                h2 { margin: 0 0 5px 0; font-size: 16px; font-weight: bold; }
                p { margin: 2px 0; }
                
                /* Garis putus-putus ala struk */
                .divider {
                    border-top: 1px dashed #000;
                    margin: 8px 0;
                }
                
                /* Kotak Hadiah biar menonjol */
                .prize-box {
                    font-size: 16px;
                    font-weight: bold;
                    text-align: center;
                    border: 1px solid #000;
                    padding: 5px;
                    margin: 8px 0;
                    text-transform: uppercase;
                }
            </style>
        </head>
        <body>
            <div class="left">
                <p>Waktu  : ${waktu}</p>
                <p>Member : ${nama}</p>
                <p>Kelas  : ${kelas}</p>
            </div>
        
            <script>
                // Otomatis print dan tutup tab
                window.onload = function() {
                    window.print();
                    setTimeout(() => window.close(), 500); 
                }
            </script>
        </body>
        </html>
    `;

    // 3. Buka jendela popup kecil untuk print
    const printWindow = window.open('', '_blank', 'width=300,height=500');
    printWindow.document.write(strukHTML);
    printWindow.document.close();

    // 4. Tandai sebagai sudah di-print
    markAsPrinted(logId);
    loadAllData();
}

function getPrintedLogs() {
    return JSON.parse(localStorage.getItem('printed_skyemperor') || '[]');
}

function markAsPrinted(logId) {
    let printed = getPrintedLogs();
    if (!printed.includes(logId)) {
        printed.push(logId);
        localStorage.setItem('printed_skyemperor', JSON.stringify(printed));
    }
}

// === FUNGSI COLLAPSE / HIDE SIDEBAR ===
document.addEventListener('DOMContentLoaded', () => {
    const collapseBtn = document.querySelector('.collapse-icon');
    const sidebar = document.querySelector('.sidebar');
    
    if (collapseBtn && sidebar) {
        collapseBtn.addEventListener('click', () => {
            // Tambahkan atau hapus class 'collapsed' saat diklik
            sidebar.classList.toggle('collapsed');
        });
    }
});

// === FILTER HISTORY BERDASARKAN TANGGAL ===
const filterDateInput = document.getElementById("filter-date-logs");

if (filterDateInput) {
    filterDateInput.addEventListener("change", (e) => {
        const selectedDate = e.target.value; // Format dari input date adalah YYYY-MM-DD
        
        // Kalau kotak tanggal dikosongkan, tampilkan semua data
        if (!selectedDate) {
            renderLogs(globalLogs);
            return;
        }

        // Filter data history
        const filteredLogs = globalLogs.filter(row => {
            let dateObj = new Date(row[0]);
            if (isNaN(dateObj)) return false;
            
            // Ambil tahun, bulan, dan hari untuk dicocokkan (Format: YYYY-MM-DD)
            let year = dateObj.getFullYear();
            let month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Ditambah 0 di depan jika 1 digit
            let day = String(dateObj.getDate()).padStart(2, '0');
            
            let rowDateStr = `${year}-${month}-${day}`;
            
            return rowDateStr === selectedDate;
        });

        // Tampilkan data yang sudah difilter
        renderLogs(filteredLogs);
    });
}

// Fungsi untuk tombol Reset
function resetFilterDate() {
    const dateInput = document.getElementById("filter-date-logs");
    if (dateInput) {
        dateInput.value = ""; // Kosongkan input
        renderLogs(globalLogs); // Tampilkan semua data kembali
    }
}

// Update fungsi menutup modal saat klik di luar kotak
window.onclick = function(event) {
    const editModal = document.getElementById("edit-modal");
    const addModal = document.getElementById("add-modal");
    if (event.target == editModal) {
        editModal.style.display = "none";
    }
    if (event.target == addModal) {
        addModal.style.display = "none";
    }
}

// === RENDER DASHBOARD (Statistik & Dropdown Top-Up) ===
function renderDashboard() {
    // 1. HITUNG STATISTIK PRESENTASE GACHA
    const statsContainer = document.getElementById("dashboard-stats");
    
    if (globalLogs.length === 0) {
        statsContainer.innerHTML = "<p style='color:#888;'>Belum ada data history gacha.</p>";
    } else {
        const totalGacha = globalLogs.length;
        const prizeCounts = {};
        
        // Hitung berapa kali tiap hadiah didapat
        globalLogs.forEach(log => {
            const prize = log[3]; // Kolom Hadiah ada di index 3
            prizeCounts[prize] = (prizeCounts[prize] || 0) + 1;
        });

        let htmlStats = "";
        // Urutkan berdasarkan yang paling banyak didapat
        const sortedPrizes = Object.entries(prizeCounts).sort((a, b) => b[1] - a[1]);

        for (const [prize, count] of sortedPrizes) {
            const percentage = ((count / totalGacha) * 100).toFixed(1);
            htmlStats += `
                <div class="stat-card">
                    <h4>${prize}</h4>
                    <div class="percent" style="color: ${percentage > 30 ? '#10b981' : '#0f172a'};">${percentage}%</div>
                    <div class="count">${count} kali didapat</div>
                </div>
            `;
        }
        statsContainer.innerHTML = htmlStats;
    }

    // 2. ISI DROPDOWN MEMBER UNTUK TAMBAH JATAH
    const selectMember = document.getElementById("select-member-quota");
    if (selectMember) {
        selectMember.innerHTML = '<option value="">-- Pilih Member --</option>'; // Reset awal
        
        globalMembers.forEach(member => {
            const nama = member[0];
            const kelas = member[1];
            const sisaJatah = member[3] || 0;
            
            // Simpan nama dan kelas sebagai value untuk dikirim ke server
            selectMember.innerHTML += `<option value="${nama}|${kelas}">${nama} (${kelas}) - Sisa Jatah: ${sisaJatah}x</option>`;
        });
    }
}

// === FUNGSI SUBMIT TAMBAH JATAH GACHA ===
async function submitAddQuota() {
    const selectVal = document.getElementById("select-member-quota").value;
    const amount = document.getElementById("input-quota-amount").value;

    if (!selectVal || !amount || amount <= 0) {
        return alert("Pilih member dan masukkan jumlah jatah yang valid!");
    }

    // Pisahkan nama dan kelas dari value dropdown
    const [nama, kelas] = selectVal.split("|");

    if (confirm(`Tambahkan ${amount} jatah spin untuk ${nama}?`)) {
        const btn = document.querySelector("button[onclick='submitAddQuota()']");
        const originalText = btn.innerHTML;
        btn.innerHTML = "Menambahkan...";
        btn.disabled = true;

        const fd = new FormData();
        fd.append("action", "addQuota");
        fd.append("nama", nama);
        fd.append("kelas", kelas);
        fd.append("amount", amount);

        try {
            await fetch(scriptURL, { method: "POST", body: fd });
            alert(`Sukses! ${amount} Jatah gacha berhasil ditambahkan ke ${nama}.`);
            
            document.getElementById("input-quota-amount").value = ""; // Kosongkan input
            location.reload(); // Refresh untuk melihat update
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan saat menambahkan jatah.");
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
}