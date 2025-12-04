const scriptURL = "https://script.google.com/macros/s/AKfycbye4Jt3fIbfx8bxPjJ7T1pN_se3KD0dJZN96n1VU9lkxPQlQu6r5qHlI7unRBzP0v_K0g/exec";

let currentMember = { nama: null, kelas: null };
let animationInterval = null; // Variabel untuk menyimpan timer animasi

// === Load leaderboard ===
async function loadLeaderboard() {
  try {
    const list = document.getElementById("leaderboard-list");
    if (!list) return;

    const res = await fetch(scriptURL);
    const data = await res.json();

    list.innerHTML = "";

    if (data.length === 0) {
      list.innerHTML = "<p>Belum ada data.</p>";
      return;
    }

    data.forEach(item => {
      const el = document.createElement("div");
      el.classList.add("leaderboard-item");
      el.innerHTML = `<span>${item.nama} (${item.kelas})</span><span>${item.prize}</span>`;
      list.appendChild(el);
    });
  } catch (err) {
    console.error("Gagal memuat leaderboard:", err);
    const list = document.getElementById("leaderboard-list");
    if (list) list.innerHTML = "<p>Gagal memuat data.</p>";
  }
}

// === Submit member ===
const submitBtn = document.getElementById("submit-member");
if (submitBtn) {
  submitBtn.addEventListener("click", () => {
    const nama = document.getElementById("member-name").value.trim();
    const kelas = document.getElementById("member-class").value.trim();

    if (!nama || !kelas) {
      alert("Isi nama dan kelas dulu!");
      return;
    }

    currentMember = { nama, kelas };

    document.getElementById("display-name").textContent = nama;
    document.getElementById("display-class").textContent = kelas;
    
    alert(`Data tersimpan: ${nama} - ${kelas}`);
  });
}

// === Logic Animasi Gacha ===
function startGachaAnimation() {
  const slots = document.querySelectorAll(".slot");
  if (slots.length === 0) return;

  // Interval cepat untuk memindahkan class 'active' secara acak
  animationInterval = setInterval(() => {
    // Matikan semua slot dulu
    slots.forEach(slot => slot.classList.remove("active"));
    
    // Pilih satu slot acak untuk dinyalakan
    const randomIndex = Math.floor(Math.random() * slots.length);
    slots[randomIndex].classList.add("active");
  }, 100); // Ganti setiap 100ms (0.1 detik)
}

function stopGachaAnimation(winningPrize) {
  clearInterval(animationInterval); // Hentikan acakan
  
  const slots = document.querySelectorAll(".slot");
  
  // Bersihkan semua highlight dulu
  slots.forEach(slot => slot.classList.remove("active"));

  // Cari slot yang teksnya sesuai dengan hadiah
  let found = false;
  slots.forEach(slot => {
    if (slot.textContent.trim() === winningPrize.trim()) {
      slot.classList.add("active"); // Highlight pemenang
      found = true;
    }
  });

  if (!found) {
    console.warn("Hadiah tidak ditemukan di slot visual:", winningPrize);
  }
}

// === Tombol Gacha ===
const gachaBtn = document.getElementById("gacha-btn");
if (gachaBtn) {
  gachaBtn.addEventListener("click", async () => {
    if (!currentMember.nama || !currentMember.kelas) {
      alert("Pilih/isi member dulu sebelum gacha!");
      return;
    }

    try {
      gachaBtn.disabled = true;
      gachaBtn.textContent = "Rolling..."; // Ganti teks tombol
      
      // 1. Mulai animasi visual
      startGachaAnimation();

      const formData = new FormData();
      formData.append("nama", currentMember.nama);
      formData.append("kelas", currentMember.kelas);

      // 2. Request ke server (animasi tetap jalan selama menunggu ini)
      const res = await fetch(scriptURL, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      
      // 3. Hentikan animasi dan tunjuk pemenang
      stopGachaAnimation(result.prize);

      // Beri sedikit delay sebelum alert muncul agar user lihat slot yang nyala
      setTimeout(() => {
        alert(`Selamat ${currentMember.nama}! Kamu dapat: ${result.prize}`);
        
        // Reset tombol dan refresh log
        gachaBtn.disabled = false;
        gachaBtn.textContent = "Start";
        loadLeaderboard();
      }, 500); // Delay 0.5 detik

    } catch (err) {
      console.error(err);
      clearInterval(animationInterval); // Pastikan animasi berhenti kalau error
      const slots = document.querySelectorAll(".slot");
      slots.forEach(s => s.classList.remove("active"));
      
      alert("Terjadi kesalahan koneksi, coba lagi.");
      gachaBtn.disabled = false;
      gachaBtn.textContent = "Start";
    }
  });
}

window.addEventListener("DOMContentLoaded", loadLeaderboard);