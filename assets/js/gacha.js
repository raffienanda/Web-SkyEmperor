// === GANTI URL INI DENGAN URL DEPLOYMENT BARU KAMU ===
const scriptURL = "https://script.google.com/macros/s/AKfycbx9ezGFBv_Yme4VrP1CHHX2nuDeeXRh7nJ6zenkkUWZ5A5PfPiYz8k3eN8CXukLITK0/exec"; // <-- Pastikan ini URL terbaru

let currentMember = { nama: null, kelas: null };
let animationInterval = null;

// === 1. CEK LOGIN SAAT LOAD & LOAD LEADERBOARD ===
window.addEventListener("DOMContentLoaded", () => {
  const session = localStorage.getItem("user_skyemperor");
  
  // Kalau belum login, tendang balik ke index.html
  if (!session) {
    alert("Silakan login terlebih dahulu!");
    window.location.href = "index.html";
    return;
  }

  // Kalau ada session, isi data member
  const user = JSON.parse(session);
  currentMember.nama = user.nama;
  currentMember.kelas = user.kelas;

  // Update tampilan nama di pojok kiri
  const dispName = document.getElementById("display-name");
  const dispClass = document.getElementById("display-class");
  if(dispName) dispName.textContent = user.nama;
  if(dispClass) dispClass.textContent = user.kelas;

  // Panggil fungsi load data (ini yang tadi error karena hilang)
  loadLeaderboard(); 
});

// === 2. FUNGSI LOGOUT ===
window.logout = function() {
  if (confirm("Yakin ingin logout?")) {
    localStorage.removeItem("user_skyemperor");
    window.location.href = "index.html";
  }
};

// === 3. FUNGSI LOAD LEADERBOARD (LOG) ===
async function loadLeaderboard() {
  const list = document.getElementById("leaderboard-list");
  if (!list) return;

  try {
    // Tampilkan loading sederhana
    // list.innerHTML = "<p>Loading...</p>"; // Opsional, bisa dimatikan biar ga kedip

    const res = await fetch(scriptURL);
    const data = await res.json();

    list.innerHTML = ""; // Bersihkan isi lama

    if (!data || data.length === 0) {
      list.innerHTML = "<p>Belum ada data.</p>";
      return;
    }

    // Loop data dan masukkan ke HTML
    data.forEach(item => {
      const el = document.createElement("div");
      el.classList.add("leaderboard-item");
      el.innerHTML = `<span>${item.nama} (${item.kelas})</span><span>${item.prize}</span>`;
      list.appendChild(el);
    });

  } catch (err) {
    console.error("Gagal memuat leaderboard:", err);
    list.innerHTML = "<p>Gagal memuat data.</p>";
  }
}

// === 4. LOGIC ANIMASI VISUAL ===
function startGachaAnimation() {
  const slots = document.querySelectorAll(".slot");
  if (slots.length === 0) return;

  animationInterval = setInterval(() => {
    // Matikan semua highlight
    slots.forEach(slot => slot.classList.remove("active"));
    
    // Nyalakan satu secara acak
    const randomIndex = Math.floor(Math.random() * slots.length);
    slots[randomIndex].classList.add("active");
  }, 100); // Kecepatan kedip (0.1 detik)
}

function stopGachaAnimation(winningPrize) {
  clearInterval(animationInterval); // Stop acakan
  
  const slots = document.querySelectorAll(".slot");
  slots.forEach(slot => slot.classList.remove("active")); // Reset

  // Cari kotak yang tulisannya sama dengan hadiah
  let found = false;
  slots.forEach(slot => {
    // Normalisasi text agar pencarian akurat (trim spasi)
    if (slot.textContent.trim().toLowerCase() === winningPrize.trim().toLowerCase()) {
      slot.classList.add("active"); // Highlight pemenang
      found = true;
    }
  });

  if (!found && winningPrize !== "Semua hadiah habis!") {
    console.warn("Hadiah tidak ada di slot visual:", winningPrize);
  }
}

// === 5. TOMBOL GACHA (START) ===
const gachaBtn = document.getElementById("gacha-btn");
if (gachaBtn) {
  gachaBtn.addEventListener("click", async () => {
    
    // Safety check session lagi
    if (!currentMember.nama) {
        alert("Sesi habis, silakan login ulang.");
        window.location.href = "index.html";
        return;
    }

    try {
      // Kunci tombol biar ga di-spam
      gachaBtn.disabled = true;
      gachaBtn.textContent = "Rolling..."; 
      
      // Mulai animasi visual (biar user seneng nunggu)
      startGachaAnimation();

      // Siapkan data kirim
      const formData = new FormData();
      formData.append("action", "spin"); 
      formData.append("nama", currentMember.nama);
      formData.append("kelas", currentMember.kelas);

      // Request ke Google Sheet
      const res = await fetch(scriptURL, { method: "POST", body: formData });
      const result = await res.json();
      
      // Stop animasi di item yang didapat
      // Jika error/habis, tampilkan apa adanya
      const prizeText = result.prize || "Zonk";
      stopGachaAnimation(prizeText);

      // Delay sedikit biar user lihat slot yang nyala, baru muncul alert
      setTimeout(() => {
        if (prizeText.includes("habis") || prizeText.includes("Error") || prizeText.includes("Lengkap")) {
             alert(prizeText); // Alert Error
        } else {
             alert(`Selamat ${currentMember.nama}! Kamu dapat: ${prizeText}`);
        }
        
        // Reset tombol
        gachaBtn.disabled = false;
        gachaBtn.textContent = "Start";
        
        // Refresh Log Pemenang
        loadLeaderboard();
      }, 500); 

    } catch (err) {
      console.error(err);
      clearInterval(animationInterval);
      document.querySelectorAll(".slot").forEach(s => s.classList.remove("active"));
      
      alert("Terjadi kesalahan koneksi atau Script URL salah.");
      gachaBtn.disabled = false;
      gachaBtn.textContent = "Start";
    }
  });
}