// === GANTI DENGAN URL APPS SCRIPT KAMU ===
const scriptURL = "https://script.google.com/macros/s/AKfycby7WoVyO_Nij3z19VIqJR8DDoGy6i0X8L2B1fxesySffle7upN9DjimRpJXiD-Tb5Fn8Q/exec"; 

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

// 1. FUNGSI TOMBOL REFRESH
if (btnRefresh) {
    btnRefresh.addEventListener("click", async () => {
        btnRefresh.textContent = "⏳ Mengecek...";
        btnRefresh.disabled = true;

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
                btnGacha.textContent = `Start (${remainingSpins}x)`;
                btnGacha.style.backgroundColor = "white";
                btnGacha.style.color = "#1e3a8a";
                btnGacha.style.cursor = "pointer";
                btnGacha.style.boxShadow = "0 4px #263d6b";
            } else {
                // PAKAI CUSTOM ALERT
                showCustomAlert("Gagal", "Belum ada sesi aktif dari Admin! Atau jatah sudah habis.");
                resetMesin();
            }
        } catch (err) {
            // PAKAI CUSTOM ALERT
            showCustomAlert("Error", "Gagal terhubung ke server.");
        }

        btnRefresh.textContent = "🔄 Refresh Sesi";
        btnRefresh.disabled = false;
    });
}

// 2. FUNGSI TOMBOL START
if (btnGacha) {
  btnGacha.addEventListener("click", async () => {
    if (remainingSpins <= 0 || !activeMember) return;

    try {
      btnGacha.disabled = true;
      btnGacha.textContent = "Rolling..."; 
      startGachaAnimation();

      const formData = new FormData();
      formData.append("action", "spin"); 

      const res = await fetch(scriptURL, { method: "POST", body: formData });
      const result = await res.json();
      
      const prizeText = result.prize || "Zonk";
      stopGachaAnimation(prizeText);

      setTimeout(() => {
        if (prizeText.includes("habis") || prizeText.includes("Error")) {
             // PAKAI CUSTOM ALERT
             showCustomAlert("Maaf", prizeText);
             resetMesin();
        } else {
             remainingSpins--; 
             dispSpins.textContent = remainingSpins;
             
             // PAKAI CUSTOM ALERT
             showCustomAlert("Selamat!", `Wow ${activeMember}! Kamu mendapatkan hadiah: ${prizeText}`);

             if (remainingSpins > 0) {
                btnGacha.textContent = `Start (${remainingSpins}x)`;
                btnGacha.disabled = false;
             } else {
                resetMesin();
             }
        }
        
        loadLeaderboard(); 
      }, 500); 

    } catch (err) {
      clearInterval(animationInterval);
      showCustomAlert("Error", "Terjadi kesalahan koneksi saat memutar mesin.");
      btnGacha.textContent = `Start (${remainingSpins}x)`;
      btnGacha.disabled = false;
    }
  });
}