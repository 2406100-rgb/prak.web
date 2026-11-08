// File: script.js
document.addEventListener("DOMContentLoaded", () => {
  // 1. Tangkap elemen DOM
  const btnFetch = document.querySelector("#btnFetch");
  const statusMessage = document.querySelector("#statusMessage");
  const userList = document.querySelector("#userList");

  const API_URL = "https://jsonplaceholder.typicode.com/users";

  // 2. Fungsi pembantu: membuat satu elemen dengan class dan teks
  const buatElemen = (className, teks) => {
    const el = document.createElement("div");
    el.className = className;
    el.textContent = teks; // aman dari XSS
    return el;
  };

  // 3. Fungsi Render Kartu Pengguna ke DOM
  const renderUsers = (users) => {
    userList.innerHTML = "";

    users.forEach((user) => {
      const card = document.createElement("div");
      card.className = "user-card";

      card.appendChild(buatElemen("user-name", user.name));
      card.appendChild(buatElemen("user-email", user.email));
      card.appendChild(buatElemen("user-company", user.company.name));

      userList.appendChild(card);
    });
  };

  // 4. Fungsi Asinkronus untuk Mengambil Data Pengguna dari Server API
  const fetchUsers = async () => {
    // A. Tampilkan status loading saat proses dimulai
    btnFetch.disabled = true;
    statusMessage.textContent = "Sedang memuat data dari server...";
    statusMessage.className = "status-msg";
    userList.innerHTML = "";

    try {
      // B. Kirim HTTP Request ke URL API
      const response = await fetch(API_URL);

      // C. Cek apakah server merespons dengan sukses (status 200-299)
      if (!response.ok) {
        throw new Error(`Gagal mengambil data! Status HTTP: ${response.status}`);
      }

      // D. Konversi respons JSON menjadi array objek JavaScript
      const users = await response.json();

      // E. Tampilkan hasil ke layar
      statusMessage.textContent = `Berhasil memuat ${users.length} data pengguna!`;
      renderUsers(users);
    } catch (error) {
      // F. Tangani error jaringan, URL salah, atau status HTTP gagal
      statusMessage.textContent = `Gagal memuat data: ${error.message}`;
      statusMessage.className = "status-msg error";
    } finally {
      // G. Aktifkan kembali tombol setelah proses selesai (sukses maupun gagal)
      btnFetch.disabled = false;
    }
  };

  // 5. Tambahkan Event Listener pada tombol
  btnFetch.addEventListener("click", fetchUsers);
});