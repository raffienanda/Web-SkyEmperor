const scriptURL = "https://script.google.com/macros/s/AKfycbzXifCyzfJz0ad9du6CmXwS_5qBsgxmbW9wQQVpVfvvMtRVn0dHRLEqes2d0xP1ttTXsA/exec";

let globalMembers = [];
let globalLogs = [];

const sessionString = localStorage.getItem("user_skyemperor");
if (!sessionString) {
    alert("Akses Ditolak! Silakan login terlebih dahulu.");
    window.location.href = "login.html";
}

const userSession = JSON.parse(sessionString);
const userRole = (userSession.role || "Member").trim().toLowerCase();

if (userRole === "member" || userRole === "") {
    alert("Akses Ditolak! Halaman ini khusus Admin dan Operator.");
    window.location.href = "gacha.html";
}

window.addEventListener("DOMContentLoaded", () => {
    // --- TAMBAHAN: Tampilkan Nama & Role di Sidebar Kiri Bawah ---
    const adminNameDisplay = document.getElementById("display-admin-name");
    const adminRoleDisplay = document.getElementById("display-admin-role");

    if (adminNameDisplay && adminRoleDisplay && userSession) {
        // Ambil nama depan saja biar tidak kepanjangan
        const firstName = userSession.nama.split(" ")[0];
        adminNameDisplay.textContent = firstName;
        adminRoleDisplay.textContent = userRole;
    }
    // -----------------------------------------------------------

    if (userRole === "operator") {
        const navItems = document.querySelectorAll(".sidebar-nav .nav-item");
        if (navItems.length >= 4) {
            navItems[1].style.display = "none";
            navItems[2].style.display = "none";
        }
    }
    loadAllData();
});

const searchInput = document.getElementById("search-member");
if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
        const keyword = e.target.value.toLowerCase();
        const filteredMembers = globalMembers.filter(row => {
            const nama = (row[0] || "").toString().toLowerCase();
            const kelas = (row[1] || "").toString().toLowerCase();
            const role = (row[2] || "").toString().toLowerCase();
            return nama.includes(keyword) || kelas.includes(keyword) || role.includes(keyword);
        });
        renderMembers(filteredMembers);
    });
}

async function loadAllData() {
    try {
        const res = await fetch(scriptURL + "?action=getAllData");
        const data = await res.json();

        globalMembers = data.members || [];
        globalLogs = data.logs || [];

        renderMembers(globalMembers);
        renderPrizes(data.prizes || []);
        renderLogs(globalLogs);
        renderDashboard();
    } catch (err) {
        console.error(err);
    }
}

// --- RENDER MEMBERS (Tanpa Count) ---
function renderMembers(data) {
    const tbody = document.querySelector("#table-members tbody");
    tbody.innerHTML = "";

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Tidak ada data ditemukan.</td></tr>`;
        return;
    }

    data.forEach(row => {
        let role = row[2] ? row[2] : "Member";
        let roleColor = role === "Admin" ? "color: #dc2626; font-weight: bold;" :
            (role === "Operator" ? "color: #0284c7; font-weight: bold;" : "color: #666;");

        tbody.innerHTML += `
            <tr>
            <td style="color: #333; font-weight: 600;">${row[0]}</td>
            <td>${row[1]}</td>
            <td style="${roleColor}">${role}</td>
            <td>
                <button class="btn-action-pill pill-delete" onclick="deleteMember('${row[0]}')">DELETE</button>
                <button class="btn-action-pill pill-edit" onclick="openEditModal('${row[0]}', '${row[1]}', '${role}')">EDIT</button>
            </td>
            </tr>`;
    });
}

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

// --- RENDER LOGS (Waktu, Nama, Hadiah) ---
function renderLogs(data) {
    const tbody = document.querySelector("#table-logs tbody");
    tbody.innerHTML = "";
    
    // Membalik urutan agar log terbaru muncul di paling atas
    const reversed = data.slice().reverse();
    const printedLogs = getPrintedLogs();

    reversed.forEach(row => {
        // Kolom A (index 0): Waktu
        let dateObj = new Date(row[0]);
        let timeString = isNaN(dateObj) ? row[0] : dateObj.toLocaleString();

        // Kolom B (index 1): Nama Member
        let safeName = row[1] ? row[1].toString().replace(/'/g, "\\'") : "-";

        // Kolom C (index 2): Prize (Hadiah)
        let safePrize = row[2] ? row[2].toString().replace(/'/g, "\\'") : "-"; 

        // Kolom D (index 3): Admin/Operator yang memberi jatah
        let adminGiver = row[3] ? row[3] : "-"; 

        let safeTime = timeString.replace(/'/g, "\\'");
        let logId = btoa(encodeURIComponent(safeTime + safeName + safePrize)); 
        
        let isPrinted = printedLogs.includes(logId);
        let btnStyle = isPrinted 
            ? "background-color: #f3f4f6; color: #9ca3af; border-color: #d1d5db;" 
            : "background-color: #e0f2fe; color: #0284c7; border-color: #7dd3fc;"; 
        let btnText = isPrinted 
            ? '<i class="fa-solid fa-check-double"></i> PRINTED' 
            : '<i class="fa-solid fa-print"></i> PRINT';

        tbody.innerHTML += `
            <tr>
                <td style="font-size:12px;">${timeString}</td>
                <td>${row[1]}</td>
                <td style="color:#d97706; font-weight:800;">${safePrize}</td>
                <td style="font-style: italic; color: #3b4e6b;">${adminGiver}</td>
                <td>
                    <button class="btn-action-pill" style="${btnStyle}" 
                    onclick="printStruk('${safeTime}', '${safeName}', '${safePrize}', '${logId}')">
                        ${btnText}
                    </button>
                </td>
            </tr>`;
    });
}

// --- FUNGSI ADMIN ---
async function addMember() {
    const nama = document.getElementById("new-member-name").value;
    const kelas = document.getElementById("new-member-class").value;
    const role = document.getElementById("new-member-role").value;

    if (!nama || !kelas || !role) return alert("Lengkapi data!");

    if (confirm("Tambah member ini?")) {
        const btn = document.querySelector("#add-modal .btn-save");
        if (btn) { btn.textContent = "Menyimpan..."; btn.disabled = true; }

        const fd = new FormData();
        fd.append("action", "addMember");
        fd.append("nama", nama);
        fd.append("kelas", kelas);
        fd.append("role", role);

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

function switchTab(tabName, element) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');

    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if (element) element.classList.add('active');
}

function logoutAdmin() {
    if (confirm("Yakin ingin log out?")) {
        localStorage.removeItem("user_skyemperor");
        window.location.href = "login.html";
    }
}

function openEditModal(name, kelas, role) {
    const modal = document.getElementById("edit-modal");
    document.getElementById("edit-old-name").value = name;
    document.getElementById("edit-name").value = name;
    document.getElementById("edit-class").value = kelas;
    document.getElementById("edit-role").value = role;
    modal.style.display = "block";
}

function closeEditModal() { document.getElementById("edit-modal").style.display = "none"; }
function openAddModal() { document.getElementById("add-modal").style.display = "block"; }
function closeAddModal() { document.getElementById("add-modal").style.display = "none"; }

async function saveEditMember() {
    const oldName = document.getElementById("edit-old-name").value;
    const newName = document.getElementById("edit-name").value;
    const newClass = document.getElementById("edit-class").value;
    const newRole = document.getElementById("edit-role").value;

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

        await fetch(scriptURL, { method: "POST", body: fd });
        alert("Data Berhasil Diupdate!");
        location.reload();
    } catch (err) {
        alert("Gagal mengupdate data.");
        btn.textContent = "Simpan Perubahan";
        btn.disabled = false;
    }
}

function printStruk(waktu, nama, prize, logId) {
    let printedLogs = getPrintedLogs();
    if (printedLogs.includes(logId)) {
        if (!confirm("Struk ini sudah pernah dicetak!\nApakah kamu yakin ingin mencetak ulang (Reprint)?")) return;
    }

    const strukHTML = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <style>
                @page { margin: 0; }
                body { font-family: 'Courier New', Courier, monospace; width: 58mm; margin: 0; padding: 5mm; font-size: 12px; line-height: 1.4; box-sizing: border-box; }
                .center { text-align: center; } .left { text-align: left; }
                h2 { margin: 0 0 5px 0; font-size: 16px; font-weight: bold; } p { margin: 2px 0; }
                .divider { border-top: 1px dashed #000; margin: 8px 0; }
                .prize-box { font-size: 16px; font-weight: bold; text-align: center; border: 1px solid #000; padding: 5px; margin: 8px 0; text-transform: uppercase; }
            </style>
        </head>
        <body>
            <div class="left">
                <p>Waktu  : ${waktu}</p>
                <p>Member : ${nama}</p>
            </div>
            <div class="divider"></div>
            <div class="prize-box">${prize}</div>
            <div class="divider"></div>
            <p class="center" style="font-size:10px;">Terima Kasih</p>
            <script> window.onload = function() { window.print(); setTimeout(() => window.close(), 500); } </script>
        </body>
        </html>
    `;
    const printWindow = window.open('', '_blank', 'width=300,height=500');
    printWindow.document.write(strukHTML);
    printWindow.document.close();
    markAsPrinted(logId);
    loadAllData();
}

function getPrintedLogs() { return JSON.parse(localStorage.getItem('printed_skyemperor') || '[]'); }
function markAsPrinted(logId) {
    let printed = getPrintedLogs();
    if (!printed.includes(logId)) {
        printed.push(logId);
        localStorage.setItem('printed_skyemperor', JSON.stringify(printed));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const collapseBtn = document.querySelector('.collapse-icon');
    const sidebar = document.querySelector('.sidebar');
    if (collapseBtn && sidebar) collapseBtn.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
});

const filterDateInput = document.getElementById("filter-date-logs");
if (filterDateInput) {
    filterDateInput.addEventListener("change", (e) => {
        const selectedDate = e.target.value;
        if (!selectedDate) return renderLogs(globalLogs);

        const filteredLogs = globalLogs.filter(row => {
            let dateObj = new Date(row[0]);
            if (isNaN(dateObj)) return false;
            let year = dateObj.getFullYear();
            let month = String(dateObj.getMonth() + 1).padStart(2, '0');
            let day = String(dateObj.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}` === selectedDate;
        });
        renderLogs(filteredLogs);
    });
}

function resetFilterDate() {
    const dateInput = document.getElementById("filter-date-logs");
    if (dateInput) dateInput.value = "";
    renderLogs(globalLogs);
}

window.onclick = function (event) {
    const editModal = document.getElementById("edit-modal");
    const addModal = document.getElementById("add-modal");
    if (event.target == editModal) editModal.style.display = "none";
    if (event.target == addModal) addModal.style.display = "none";
}

function renderDashboard() {
    const statsContainer = document.getElementById("dashboard-stats");
    if (globalLogs.length === 0) {
        statsContainer.innerHTML = "<p style='color:#888;'>Belum ada data history gacha.</p>";
    } else {
        const totalGacha = globalLogs.length;
        const prizeCounts = {};
        globalLogs.forEach(log => {
            const prize = log[2]; // Index 2 sekarang adalah prize
            if (prize) prizeCounts[prize] = (prizeCounts[prize] || 0) + 1;
        });

        let htmlStats = "";
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
}

// ==========================================
// PENGIRIM DATA GACHA KE SERVER (BEDA DEVICE)
// ==========================================
const btnSetGacha = document.getElementById("admin-btn-setgacha");

// Di dalam assets/js/admin.js
if (btnSetGacha) {
    btnSetGacha.addEventListener("click", async () => {
        const nama = document.getElementById("admin-gacha-nama").value.trim();
        const paket = document.getElementById("admin-gacha-billing").value;

        // AMBIL NAMA ADMIN DARI SESSION LOGIN
        const adminName = userSession ? userSession.nama : "Unknown Admin";

        if (!nama || !paket) return alert("Isi Nama dan pilih Paket Billing!");

        btnSetGacha.textContent = "Mengirim...";
        btnSetGacha.disabled = true;

        try {
            const fd = new FormData();
            fd.append("action", "setSession");
            fd.append("nama", nama);
            fd.append("spins", paket);
            fd.append("admin", adminName); // TAMBAHKAN INI: Mengirim nama admin ke spreadsheet

            await fetch(scriptURL, { method: "POST", body: fd });

            document.getElementById("admin-gacha-nama").value = "";
            document.getElementById("admin-gacha-billing").value = "";

            alert(`Sesi Gacha berhasil dikirim oleh ${adminName}!`);
        } catch (err) {
            alert("Gagal terhubung ke server.");
        }

        btnSetGacha.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Kirim ke Mesin`;
        btnSetGacha.disabled = false;
    });
}

function openFullscreenGacha() {
    const elem = document.getElementById("iframe-gacha");
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
}

// ==========================================
// FUNGSI FULL SCREEN IFRAME GACHA
// ==========================================
function openFullscreenGacha() {
    const elem = document.getElementById("iframe-gacha");

    // Pengecekan agar support di berbagai jenis browser
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}