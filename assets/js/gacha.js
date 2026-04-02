const scriptURL = "https://script.google.com/macros/s/AKfycbzXifCyzfJz0ad9du6CmXwS_5qBsgxmbW9wQQVpVfvvMtRVn0dHRLEqes2d0xP1ttTXsA/exec";

let animationInterval = null;
let activeMember = "";
let remainingSpins = 0;

window.addEventListener("DOMContentLoaded", loadLeaderboard);

function showCustomAlert(title, text) {
    document.getElementById("custom-alert-title").textContent = title;
    document.getElementById("custom-alert-text").textContent = text;
    document.getElementById("custom-alert").style.display = "flex";
}

function closeCustomAlert() {
    document.getElementById("custom-alert").style.display = "none";
}

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
            let nama = item[1];
            let hadiah = item[2];

            const el = document.createElement("div");
            el.classList.add("leaderboard-item");

            el.innerHTML = `<span>${nama}</span><span>${hadiah}</span>`;
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

async function checkSession(isManual = false) {
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
            btnGacha.textContent = `Tahan Tombol (${remainingSpins}x)`;
            btnGacha.style.backgroundColor = "white";
            btnGacha.style.color = "#1e3a8a";
            btnGacha.style.cursor = "pointer";
            btnGacha.style.boxShadow = "0 4px #263d6b";
        } else {
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

setInterval(() => {
    checkSession(false);
    loadLeaderboard();
}, 5000);

if (btnRefresh) {
    btnRefresh.addEventListener("click", async () => {
        btnRefresh.textContent = "⏳ Mengecek...";
        btnRefresh.disabled = true;

        await checkSession(true);

        btnRefresh.textContent = "🔄 Refresh Sesi";
        btnRefresh.disabled = false;
    });
}

if (btnGacha) {
    let isHolding = false;
    let isFetching = false;

    const startHold = (e) => {
        if (remainingSpins <= 0 || !activeMember || isFetching) return;

        isHolding = true;

        btnGacha.textContent = "Lepas untuk Berhenti!";
        btnGacha.style.transform = "scale(0.95)";
        btnGacha.style.boxShadow = "none";

        startGachaAnimation();
    };

    const releaseHold = async (e) => {
        if (!isHolding || isFetching) return;

        isHolding = false;
        isFetching = true;

        btnGacha.style.transform = "";
        btnGacha.disabled = true;
        btnGacha.textContent = "Mengambil Hasil...";

        try {
            const formData = new FormData();
            formData.append("action", "spin");

            const res = await fetch(scriptURL, { method: "POST", body: formData });
            const result = await res.json();

            const prizeText = result.prize || "Zonk";

            stopGachaAnimation(prizeText);

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
            }, 600);

        } catch (err) {
            clearInterval(animationInterval);
            showCustomAlert("Error", "Terjadi kesalahan koneksi saat memutar mesin.");
            btnGacha.textContent = `Tahan Tombol (${remainingSpins}x)`;
            btnGacha.disabled = false;
        } finally {
            isFetching = false;
        }
    };

    btnGacha.addEventListener("mousedown", startHold);
    btnGacha.addEventListener("mouseup", releaseHold);
    btnGacha.addEventListener("mouseleave", releaseHold);

    btnGacha.addEventListener("touchstart", (e) => {
        e.preventDefault();
        startHold(e);
    }, { passive: false });
    btnGacha.addEventListener("touchend", releaseHold);
    btnGacha.addEventListener("touchcancel", releaseHold);
}