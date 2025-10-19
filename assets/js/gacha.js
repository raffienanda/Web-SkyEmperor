const scriptURL = "https://script.google.com/macros/s/AKfycbye4Jt3fIbfx8bxPjJ7T1pN_se3KD0dJZN96n1VU9lkxPQlQu6r5qHlI7unRBzP0v_K0g/exec";

let currentMember = { nama: null, kelas: null };

// === Load leaderboard ===
async function loadLeaderboard() {
  try {
    const res = await fetch(scriptURL);
    const data = await res.json();

    const list = document.getElementById("leaderboard-list");
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
    console.error(err);
  }
}

// === Submit member ===
document.getElementById("submit-member").addEventListener("click", () => {
  const nama = document.getElementById("member-name").value.trim();
  const kelas = document.getElementById("member-class").value.trim();

  if (!nama || !kelas) {
    alert("Isi nama dan kelas dulu!");
    return;
  }

  currentMember = { nama, kelas };

  document.getElementById("display-name").textContent = nama;
  document.getElementById("display-class").textContent = kelas;

//   alert(`Member diset: ${nama} (${kelas})`);
});

// === Tombol Gacha ===
document.getElementById("gacha-btn").addEventListener("click", async () => {
  if (!currentMember.nama || !currentMember.kelas) {
    alert("Pilih/isi member dulu sebelum gacha!");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("nama", currentMember.nama);
    formData.append("kelas", currentMember.kelas);

    try {
    const res = await fetch(scriptURL, {
        method: "POST",
        body: formData, // TANPA headers
    });

    const result = await res.json();
    alert(`Selamat ${currentMember.nama}! Kamu dapat: ${result.prize}`);
    loadLeaderboard();
    } catch (err) {
    
    }

        const result = await res.json();
        alert(`Selamat ${currentMember.nama}! Kamu dapat: ${result.prize}`);
        loadLeaderboard();
    } catch (err) {
        
    }
    });

window.addEventListener("DOMContentLoaded", loadLeaderboard);
