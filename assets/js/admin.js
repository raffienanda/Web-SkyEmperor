const scriptURL = "https://script.google.com/macros/s/AKfycbye4Jt3fIbfx8bxPjJ7T1pN_se3KD0dJZN96n1VU9lkxPQlQu6r5qHlI7unRBzP0v_K0g/exec";

let isEditing = false;

// === 1. READ (Load Data) ===
async function loadData() {
  const container = document.getElementById("data-list");
  container.innerHTML = '<p style="text-align:center;">Mengambil data...</p>';

  try {
    const res = await fetch(scriptURL);
    const data = await res.json();
    
    container.innerHTML = ""; // Bersihkan loading

    if (data.length === 0) {
      container.innerHTML = '<p style="text-align:center;">Data kosong.</p>';
      return;
    }

    data.forEach(item => {
      const row = document.createElement("div");
      row.classList.add("data-row");
      row.innerHTML = `
        <span>${item.nama}</span>
        <span>${item.kelas}</span>
        <span>${item.prize || '-'}</span>
        <div>
          <button class="btn-edit" onclick="editData('${item.nama}', '${item.kelas}', '${item.prize}')">Edit</button>
          <button class="btn-delete" onclick="deleteData('${item.nama}')">Hapus</button>
        </div>
      `;
      container.appendChild(row);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = '<p style="text-align:center; color: #ff9999;">Gagal memuat data.</p>';
  }
}

// === 2. CREATE & UPDATE (Simpan Data) ===
document.getElementById("btn-save").addEventListener("click", async () => {
  const nama = document.getElementById("admin-nama").value.trim();
  const kelas = document.getElementById("admin-kelas").value.trim();
  const prize = document.getElementById("admin-prize").value.trim();
  const oldName = document.getElementById("old-name").value; // Untuk edit

  if (!nama || !kelas) {
    alert("Nama dan Kelas wajib diisi!");
    return;
  }

  const btn = document.getElementById("btn-save");
  btn.textContent = "Menyimpan...";
  btn.disabled = true;

  const formData = new FormData();
  formData.append("nama", nama);
  formData.append("kelas", kelas);
  formData.append("prize", prize);

  // Tentukan apakah ini EDIT atau CREATE
  if (isEditing) {
    formData.append("action", "update");
    formData.append("oldName", oldName);
  } else {
    formData.append("action", "create");
  }

  try {
    await fetch(scriptURL, { method: "POST", body: formData });
    alert(isEditing ? "Data berhasil diupdate!" : "Data berhasil ditambahkan!");
    resetForm();
    loadData(); // Refresh tabel
  } catch (err) {
    alert("Terjadi kesalahan koneksi.");
  } finally {
    btn.textContent = "Simpan";
    btn.disabled = false;
  }
});

// === 3. DELETE (Hapus Data) ===
async function deleteData(nama) {
  if (!confirm(`Yakin ingin menghapus data ${nama}?`)) return;

  const formData = new FormData();
  formData.append("action", "delete");
  formData.append("nama", nama);

  try {
    await fetch(scriptURL, { method: "POST", body: formData });
    alert("Data dihapus!");
    loadData();
  } catch (err) {
    alert("Gagal menghapus.");
  }
}

// === Helper Functions ===
window.editData = function(nama, kelas, prize) {
  isEditing = true;
  document.getElementById("form-title").textContent = "Edit Data Member";
  document.getElementById("admin-nama").value = nama;
  document.getElementById("admin-kelas").value = kelas;
  document.getElementById("admin-prize").value = (prize === 'undefined' || prize === '-') ? '' : prize;
  document.getElementById("old-name").value = nama; // Simpan nama lama sbg kunci
  
  document.getElementById("btn-cancel").style.display = "inline-block";
  window.scrollTo(0, 0); // Scroll ke atas
};

document.getElementById("btn-cancel").addEventListener("click", resetForm);

function resetForm() {
  isEditing = false;
  document.getElementById("form-title").textContent = "Tambah Data Baru";
  document.getElementById("admin-nama").value = "";
  document.getElementById("admin-kelas").value = "";
  document.getElementById("admin-prize").value = "";
  document.getElementById("old-name").value = "";
  document.getElementById("btn-cancel").style.display = "none";
}

// Load saat halaman dibuka
window.addEventListener("DOMContentLoaded", loadData);