// assets/js/admin.js

const scriptURL = "https://script.google.com/macros/s/AKfycbwxLApx-ZVsVHi_w0SjTiY2mWGxGPuozGegeapyPBMxw09GLQLkB7nySo4ykina80vlAw/exec"; // <-- Pastikan URL ini benar

// === GLOBAL VARIABLES (Untuk menampung data member agar bisa di-search) ===
let globalMembers = [];

// 1. CEK APAKAH BENAR ADMIN
if (!localStorage.getItem("admin_skyemperor")) {
    alert("Akses Ditolak! Anda bukan Admin.");
    window.location.href = "login.html";
}

// 2. LOAD DATA SAAT WEB DIBUKA
window.addEventListener("DOMContentLoaded", loadAllData);

// === EVENT LISTENER SEARCH (Fitur Baru) ===
const searchInput = document.getElementById("search-member");
if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
        const keyword = e.target.value.toLowerCase();
        
        // Filter data globalMembers berdasarkan nama (index 0) atau kelas (index 1)
        const filteredMembers = globalMembers.filter(row => {
            const nama = row[0].toString().toLowerCase();
            const kelas = row[1].toString().toLowerCase();
            return nama.includes(keyword) || kelas.includes(keyword);
        });

        // Render ulang tabel dengan data yang sudah difilter
        renderMembers(filteredMembers);
    });
}

async function loadAllData() {
    try {
        const res = await fetch(scriptURL + "?action=getAllData");
        const data = await res.json();

        // SIMPAN DATA MEMBER KE VARIABEL GLOBAL
        globalMembers = data.members;

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
    
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Tidak ada data ditemukan.</td></tr>`;
        return;
    }

    data.forEach(row => {
        // Row[0] = Nama, Row[1] = Kelas
        // Kita tambahkan tombol Edit di kolom Aksi
        tbody.innerHTML += `
            <tr>
            <td>${row[0]}</td>
            <td><span class="badge-class">${row[1]}</span></td>
            <td>
                <button class="btn-edit" onclick="openEditModal('${row[0]}', '${row[1]}')">Edit</button>
                <button class="btn-delete" onclick="deleteMember('${row[0]}')">Hapus</button>
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

    reversed.forEach(row => {
        let dateObj = new Date(row[0]);
        let timeString = isNaN(dateObj) ? row[0] : dateObj.toLocaleString();

        tbody.innerHTML += `
            <tr>
            <td style="font-size:12px;">${timeString}</td>
            <td>${row[1]}</td>
            <td>${row[2]}</td>
            <td style="color:#ffd700; font-weight:bold;">${row[3]}</td>
            </tr>`;
    });
}

// --- FUNGSI TOMBOL (Add, Delete, Update) Tetap Sama ---

async function addMember() {
    const nama = document.getElementById("new-member-name").value;
    const kelas = document.getElementById("new-member-class").value;
    if (!nama || !kelas) return alert("Lengkapi data!");

    if (confirm("Tambah member ini?")) {
        // Update UI dulu biar kerasa cepet (Optimistic UI)
        // Tapi kita reload aja biar aman sinkronisasinya
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
    
    if (!newName || !newClass) return alert("Data tidak boleh kosong!");

    const btn = document.querySelector(".btn-save");
    btn.textContent = "Menyimpan...";
    btn.disabled = true;

    try {
        const fd = new FormData();
        fd.append("action", "editMember");
        fd.append("oldName", oldName);
        fd.append("newName", newName);
        fd.append("newClass", newClass);

        await fetch(scriptURL, { method: "POST", body: fd });
        
        alert("Data Berhasil Diupdate!");
        location.reload(); // Refresh halaman
    } catch (err) {
        console.error(err);
        alert("Gagal mengupdate data.");
        btn.textContent = "Simpan Perubahan";
        btn.disabled = false;
    }
}

// Tutup modal kalau user klik di luar kotak (opsional tapi bagus UX-nya)
window.onclick = function(event) {
    const modal = document.getElementById("edit-modal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}