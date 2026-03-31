// === GANTI DENGAN URL APPS SCRIPT KAMU ===
const scriptURL = "https://script.google.com/macros/s/AKfycbzXifCyzfJz0ad9du6CmXwS_5qBsgxmbW9wQQVpVfvvMtRVn0dHRLEqes2d0xP1ttTXsA/exec"; 

let animationInterval = null;
let activeMember = "";
let remainingSpins = 0;

window.addEventListener("DOMContentLoaded", loadLeaderboard);

// ==========================================
// FUNGSI CUSTOM ALERT (BIAR GAK KELUAR FULLSCREEN)
// ==========================================
function showCustomAlert(title, text) {
    document.getElementById("custom-alert-title").textContent = title;
    document.getElementById("custom-alert-text").textContent = text;
    document.getElementById("custom-alert").style.display = "flex";
}

function closeCustomAlert() {
    document.getElementById("custom-alert").style.display = "none";
}

// ==========================================
// LOAD LOG & ANIMASI MESIN
// ==========================================
async function loadLeaderboard() {
  const list = document.getElementById("leaderboard-list");
  if (!list) return;
  try {
    const res = await fetch(scriptURL + "?action=getAllData");
    const data = await res.json();
    const logs = data.logs || [];
    const lastLogs = logs.slice(-20).reverse();
    list.innerHTML = ""; 
    if (lastLogs.length === 0) return list.innerHTML = "<p>Belum ada data.</p>";
    lastLogs.forEach(item => {
      let prizeVal = item.length >= 4 ? item[3] : item[2]; 
      const el = document.createElement("div");
      el.classList.add("leaderboard-item");
      el.innerHTML = `<span>${item[1]}</span><span>${prizeVal}</span>`;
      list.appendChild(el);
    });
  } catch (err) {
    list.innerHTML = "<p>Gagal memuat data.</p>";
  }
}

function startGachaAnimation() {
  const slots = document.querySelectorAll(".slot");
  if (slots.length === 0) return;
  animationInterval = setInterval(() => {
    slots.forEach(slot => slot.classList.remove("active"));
    slots[Math.floor(Math.random() * slots.length)].classList.add("active");
  }, 100); 
}

function stopGachaAnimation(winningPrize) {
  clearInterval(animationInterval); 
  const slots = document.querySelectorAll(".slot");
  slots.forEach(slot => slot.classList.remove("active")); 
  slots.forEach(slot => {
    if (slot.textContent.trim().toLowerCase() === winningPrize.trim().toLowerCase()) slot.classList.add("active"); 
  });
}

// ==========================================
// KONTROL MESIN GACHA (BEDA DEVICE)
// ==========================================
const btnRefresh = document.getElementById("btn-refresh");
const btnGacha = document.getElementById("gacha-btn");
const sessionInfo = document.getElementById("gacha-session-info");
const dispName = document.getElementById("gacha-display-name");
const dispSpins = document.getElementById("gacha-display-spins");

function resetMesin() {
    btnGacha.disabled = true;
    btnGacha.textContent = "Menunggu Admin...";
    btnGacha.style.backgroundColor = "#ccc";
    btnGacha.style.color = "#666";
    btnGacha.style.cursor = "not-allowed";
    btnGacha.style.boxShadow = "none";
    sessionInfo.style.display = "none";
    activeMember = "";
    remainingSpins = 0;
}

// 1. FUNGSI CEK SESI (AUTO & MANUAL)
// ==========================================
async function checkSession(isManual = false) {
    // Jika user sedang punya jatah spin atau sedang menekan tombol, jangan timpa datanya
    if (remainingSpins > 0 && !isManual) return;

    try {
        const res = await fetch(scriptURL + "?action=getSession");
        const data = await res.json();

        if (data.spins > 0) {
            activeMember = data.nama;
            remainingSpins = data.spins;

            dispName.textContent = activeMember;
            dispSpins.textContent = remainingSpins;
            sessionInfo.style.display = "block";

            btnGacha.disabled = false;
            // Gunakan teks "Tahan Tombol" atau "Start" sesuai implementasi kamu sebelumnya
            btnGacha.textContent = `Tahan Tombol (${remainingSpins}x)`; 
            btnGacha.style.backgroundColor = "white";
            btnGacha.style.color = "#1e3a8a";
            btnGacha.style.cursor = "pointer";
            btnGacha.style.boxShadow = "0 4px #263d6b";
        } else {
            // Hanya munculkan pop-up alert JIKA user mengecek secara manual
            // Supaya saat auto-refresh tidak muncul pop-up spam terus-menerus
            if (isManual) {
                showCustomAlert("Gagal", "Belum ada sesi aktif dari Admin! Atau jatah sudah habis.");
            }
            resetMesin();
        }
    } catch (err) {
        if (isManual) {
            showCustomAlert("Error", "Gagal terhubung ke server.");
        }
    }
}

// ----------------------------------------------------
// AUTO-REFRESH SETIAP 5 DETIK (5000 ms)
// ----------------------------------------------------
setInterval(() => {
    // Mengecek apakah ada sesi spin baru dari Admin
    checkSession(false);
    
    // Mengecek log pemenang terbaru (agar ikut auto-update)
    loadLeaderboard();
}, 5000);

// ----------------------------------------------------
// TOMBOL REFRESH MANUAL (Opsional: Jika user tidak sabar menunggu 5 detik)
// ----------------------------------------------------
if (btnRefresh) {
    btnRefresh.addEventListener("click", async () => {
        btnRefresh.textContent = "⏳ Mengecek...";
        btnRefresh.disabled = true;
        
        await checkSession(true); // true = tampilkan alert jika gagal/kosong
        
        btnRefresh.textContent = "🔄 Refresh Sesi";
        btnRefresh.disabled = false;
    });
}

// 2. FUNGSI TOMBOL START (SISTEM HOLD / TAHAN)
if (btnGacha) {
    let isHolding = false;
    let isFetching = false; // Mencegah double klik atau request ganda

    // Fungsi saat tombol mulai DITAHAN
    const startHold = (e) => {
        // Abaikan jika sisa spin habis atau sedang mengambil data server
        if (remainingSpins <= 0 || !activeMember || isFetching) return;
        
        isHolding = true;
        
        // Ubah tampilan tombol saat ditekan
        btnGacha.textContent = "Lepas untuk Berhenti!";
        btnGacha.style.transform = "scale(0.95)"; 
        btnGacha.style.boxShadow = "none";
        
        // Mulai animasi putaran mesin secara terus menerus
        startGachaAnimation();
    };

    // Fungsi saat tombol DILEPAS
    const releaseHold = async (e) => {
        // Cegah eksekusi jika tidak sedang menahan tombol
        if (!isHolding || isFetching) return;

        isHolding = false;
        isFetching = true;
        
        // Kembalikan ukuran tombol dan nonaktifkan sementara
        btnGacha.style.transform = ""; 
        btnGacha.disabled = true;
        btnGacha.textContent = "Mengambil Hasil...";

        try {
            // Setelah tombol dilepas, baru kita request hadiahnya ke server
            const formData = new FormData();
            formData.append("action", "spin"); 

            const res = await fetch(scriptURL, { method: "POST", body: formData });
            const result = await res.json();
            
            const prizeText = result.prize || "Zonk";
            
            // Hentikan animasi tepat di hadiah yang didapat dari server
            stopGachaAnimation(prizeText);

            // Beri jeda sedikit agar user melihat slot berhenti sebelum muncul Pop-up
            setTimeout(() => {
                if (prizeText.includes("habis") || prizeText.includes("Error")) {
                     showCustomAlert("Maaf", prizeText);
                     resetMesin();
                } else {
                     remainingSpins--; 
                     dispSpins.textContent = remainingSpins;
                     
                     showCustomAlert("Selamat!", `Wow ${activeMember}! Kamu mendapatkan hadiah: ${prizeText}`);

                     if (remainingSpins > 0) {
                        btnGacha.textContent = `Tahan Tombol (${remainingSpins}x)`;
                        btnGacha.disabled = false;
                     } else {
                        resetMesin();
                     }
                }
                
                loadLeaderboard(); 
            }, 600); // 600ms jeda sebelum pop-up muncul

        } catch (err) {
            clearInterval(animationInterval);
            showCustomAlert("Error", "Terjadi kesalahan koneksi saat memutar mesin.");
            btnGacha.textContent = `Tahan Tombol (${remainingSpins}x)`;
            btnGacha.disabled = false;
        } finally {
            isFetching = false;
        }
    };

    // --- EVENT LISTENERS ---
    
    // Untuk Desktop (Mouse)
    btnGacha.addEventListener("mousedown", startHold);
    btnGacha.addEventListener("mouseup", releaseHold);
    btnGacha.addEventListener("mouseleave", releaseHold); // Jika kursor ditarik keluar dari tombol saat menahan

    // Untuk Layar Sentuh / Mobile (HP/Tablet)
    btnGacha.addEventListener("touchstart", (e) => {
        e.preventDefault(); // Mencegah browser scroll/zoom tidak sengaja
        startHold(e);
    }, { passive: false });
    btnGacha.addEventListener("touchend", releaseHold);
    btnGacha.addEventListener("touchcancel", releaseHold);
}