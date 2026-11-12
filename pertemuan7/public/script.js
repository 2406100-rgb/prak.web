// File: public/script.js - Logika Client-Side JavaScript CRUD
document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector) => document.querySelector(selector);

  // ---------- Elemen DOM ----------
  const mhsForm = $("#mhsForm");
  const mhsIdInput = $("#mhsId");
  const nimInput = $("#nim");
  const namaInput = $("#nama");
  const jurusanInput = $("#jurusan");
  const emailInput = $("#email");
  const btnSubmit = $("#btnSubmit");
  const btnCancel = $("#btnCancel");
  const formTitle = $("#formTitle");
  const modeChip = $("#modeChip");
  const mhsTableBody = $("#mhsTableBody");
  const searchInput = $("#searchInput");
  const chipBox = $("#chipBox");
  const totalMhs = $("#totalMhs");
  const statTotal = $("#statTotal");
  const statProdi = $("#statProdi");
  const statTampil = $("#statTampil");
  const toastBox = $("#toastBox");

  const modal = $("#modal");
  const modalText = $("#modalText");
  const modalOk = $("#modalOk");
  const modalNo = $("#modalNo");

  const detailModal = $("#detailModal");
  const dAvatar = $("#dAvatar");
  const dNama = $("#dNama");
  const dJurusan = $("#dJurusan");
  const dNim = $("#dNim");
  const dEmail = $("#dEmail");
  const dProdi = $("#dProdi");
  const dId = $("#dId");

  let listMahasiswa = [];
  let prodiAktif = "semua";
  let detailId = null;

  // ---------- Animasi pembuka ----------
  const splash = $("#splash");
  setTimeout(() => {
    splash.classList.add("done");
    document.body.classList.remove("loading");
    document.body.classList.add("ready");
    setTimeout(() => splash.remove(), 800);
  }, 1900);

  // Muncul perlahan saat di-scroll
  const pengamat = new IntersectionObserver(
    (entries) => entries.forEach((en) => { if (en.isIntersecting) en.target.classList.add("in"); }),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => pengamat.observe(el));

  // Menu navigasi: tandai bagian yang sedang aktif
  const linkNav = document.querySelectorAll(".nav-links a");
  const bagian = ["#beranda", "#tambah", "#data"].map((id) => $(id));
  window.addEventListener("scroll", () => {
    let aktif = 0;
    bagian.forEach((el, i) => { if (el.getBoundingClientRect().top < 140) aktif = i; });
    linkNav.forEach((a, i) => a.classList.toggle("active", i === aktif));
  });

  // ---------- Fungsi pembantu ----------
  const animasiAngka = (el, tujuan) => {
    const awal = Number(el.dataset.nilai || 0);
    el.dataset.nilai = tujuan;
    const mulai = performance.now();
    const langkah = (t) => {
      const p = Math.min((t - mulai) / 700, 1);
      el.textContent = Math.round(awal + (tujuan - awal) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(langkah);
    };
    requestAnimationFrame(langkah);
  };

  const showAlert = (text, type = "success") => {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = text;
    toastBox.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("hide");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  const konfirmasiHapus = (nama) =>
    new Promise((resolve) => {
      modalText.textContent = `Data "${nama}" akan dihapus permanen dan tidak dapat dikembalikan.`;
      modal.classList.add("show");
      const tutup = (hasil) => {
        modal.classList.remove("show");
        modalOk.onclick = null;
        modalNo.onclick = null;
        resolve(hasil);
      };
      modalOk.onclick = () => tutup(true);
      modalNo.onclick = () => tutup(false);
    });

  // Keberhasilan ditentukan dari status HTTP (res.ok)
  const kirim = async (url, options) => {
    const res = await fetch(url, options);
    let data = {};
    try { data = await res.json(); } catch (e) { /* bukan JSON */ }
    return { ok: res.ok, pesan: data.message || data.error || "Terjadi kesalahan pada server" };
  };

  const buatSel = (teks, kelas) => {
    const td = document.createElement("td");
    td.textContent = teks;
    if (kelas) td.className = kelas;
    return td;
  };

  const warnaAvatar = (nama) => {
    let hash = 0;
    for (const huruf of nama) hash = (hash * 31 + huruf.charCodeAt(0)) % 360;
    return `linear-gradient(135deg, hsl(${hash}, 70%, 52%), hsl(${(hash + 40) % 360}, 70%, 38%))`;
  };

  const inisial = (nama) => (nama.trim()[0] || "?").toUpperCase();

  // ---------- READ ----------
  const renderChips = () => {
    const peta = new Map();
    listMahasiswa.forEach((m) => {
      const kunci = m.jurusan.trim().toLowerCase();
      if (!peta.has(kunci)) peta.set(kunci, m.jurusan.trim());
    });
    if (prodiAktif !== "semua" && !peta.has(prodiAktif)) prodiAktif = "semua";

    chipBox.innerHTML = "";
    const buat = (kunci, label) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip-filter" + (prodiAktif === kunci ? " active" : "");
      b.dataset.kunci = kunci;
      b.textContent = label;
      chipBox.appendChild(b);
    };
    buat("semua", "Semua");
    peta.forEach((label, kunci) => buat(kunci, label));
    animasiAngka(statProdi, peta.size);
  };

  // Fitur 1: saring data sesuai kolom pencarian (+ filter program studi)
  const terapkanFilter = () => {
    const kata = searchInput.value.trim().toLowerCase();
    const hasil = listMahasiswa.filter((m) => {
      const cocokKata = m.nama.toLowerCase().includes(kata) || m.nim.toLowerCase().includes(kata);
      const cocokProdi = prodiAktif === "semua" || m.jurusan.trim().toLowerCase() === prodiAktif;
      return cocokKata && cocokProdi;
    });
    animasiAngka(statTampil, hasil.length);
    renderTable(hasil);
  };

  const loadMahasiswa = async () => {
    try {
      const res = await fetch("/api/mahasiswa");
      listMahasiswa = await res.json();
      // Fitur 3: perbarui counter total
      totalMhs.textContent = listMahasiswa.length;
      animasiAngka(statTotal, listMahasiswa.length);
      renderChips();
      terapkanFilter();
    } catch (err) {
      showAlert("Gagal memuat data dari server backend", "error");
    }
  };

  const renderTable = (data) => {
    mhsTableBody.innerHTML = "";

    if (data.length === 0) {
      const tr = document.createElement("tr");
      const td = buatSel(
        listMahasiswa.length === 0
          ? "Belum ada data mahasiswa tersimpan."
          : "Tidak ada mahasiswa yang cocok dengan pencarian.",
        "empty"
      );
      td.colSpan = 6;
      tr.appendChild(td);
      mhsTableBody.appendChild(tr);
      return;
    }

    data.forEach((mhs, idx) => {
      const tr = document.createElement("tr");
      tr.style.animationDelay = `${Math.min(idx * 0.05, 0.5)}s`;

      tr.appendChild(buatSel(idx + 1, "muted"));

      const tdNama = document.createElement("td");
      const person = document.createElement("div");
      person.className = "person";
      const avatar = document.createElement("div");
      avatar.className = "avatar";
      avatar.textContent = inisial(mhs.nama);
      avatar.style.background = warnaAvatar(mhs.nama);
      const nama = document.createElement("span");
      nama.className = "person-name";
      nama.textContent = mhs.nama;
      nama.dataset.id = mhs.id;
      nama.dataset.aksi = "detail";
      person.append(avatar, nama);
      tdNama.appendChild(person);
      tr.appendChild(tdNama);

      tr.appendChild(buatSel(mhs.nim));

      const tdJurusan = document.createElement("td");
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = mhs.jurusan;
      tdJurusan.appendChild(badge);
      tr.appendChild(tdJurusan);

      tr.appendChild(buatSel(mhs.email, "muted"));

      const tdAksi = document.createElement("td");
      tdAksi.className = "center";
      [["detail", "Detail"], ["edit", "Edit"], ["delete", "Hapus"]].forEach(([aksi, label]) => {
        const b = document.createElement("button");
        b.className = `btn-action btn-${aksi}`;
        b.dataset.id = mhs.id;
        b.dataset.aksi = aksi;
        b.textContent = label;
        tdAksi.appendChild(b);
      });
      tr.appendChild(tdAksi);

      mhsTableBody.appendChild(tr);
    });
  };

  // ---------- CREATE & UPDATE ----------
  mhsForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      nim: nimInput.value.trim(),
      nama: namaInput.value.trim(),
      jurusan: jurusanInput.value.trim(),
      email: emailInput.value.trim(),
    };

    const id = mhsIdInput.value;
    const isEdit = Boolean(id);

    // Fitur 2: cegah NIM duplikat di frontend (saat edit, NIM milik data itu sendiri diabaikan)
    const nimSudahAda = listMahasiswa.some(
      (m) => m.nim === payload.nim && String(m.id) !== String(id)
    );
    if (nimSudahAda) {
      showAlert("NIM sudah terdaftar!", "error");
      return;
    }

    try {
      const hasil = await kirim(isEdit ? `/api/mahasiswa/${id}` : "/api/mahasiswa", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (hasil.ok) {
        showAlert(hasil.pesan);
        resetForm();
        loadMahasiswa();
      } else {
        showAlert(hasil.pesan, "error");
      }
    } catch (err) {
      showAlert("Gagal mengirim data ke server", "error");
    }
  });

  // ---------- EDIT ----------
  const mulaiEdit = (mhs) => {
    mhsIdInput.value = mhs.id;
    nimInput.value = mhs.nim;
    namaInput.value = mhs.nama;
    jurusanInput.value = mhs.jurusan;
    emailInput.value = mhs.email;

    formTitle.textContent = "Edit Data Mahasiswa";
    modeChip.textContent = "Mode Edit";
    modeChip.classList.add("edit");
    btnSubmit.textContent = "Perbarui Mahasiswa";
    btnCancel.hidden = false;
    $("#tambah").scrollIntoView({ behavior: "smooth" });
  };

  // ---------- DELETE ----------
  const hapusMahasiswa = async (mhs) => {
    const setuju = await konfirmasiHapus(mhs.nama);
    if (!setuju) return;
    try {
      const hasil = await kirim(`/api/mahasiswa/${mhs.id}`, { method: "DELETE" });
      if (hasil.ok) {
        showAlert(hasil.pesan);
        if (mhsIdInput.value === String(mhs.id)) resetForm();
        loadMahasiswa();
      } else {
        showAlert(hasil.pesan, "error");
      }
    } catch (err) {
      showAlert("Gagal menghapus data dari server", "error");
    }
  };

  // ---------- DETAIL (popup) ----------
  const bukaDetail = (mhs) => {
    detailId = mhs.id;
    dAvatar.textContent = inisial(mhs.nama);
    dAvatar.style.background = warnaAvatar(mhs.nama);
    dNama.textContent = mhs.nama;
    dJurusan.textContent = mhs.jurusan;
    dNim.textContent = mhs.nim;
    dEmail.textContent = mhs.email;
    dProdi.textContent = mhs.jurusan;
    dId.textContent = `#${mhs.id}`;
    detailModal.classList.add("show");
  };
  const tutupDetail = () => {
    detailModal.classList.remove("show");
    detailId = null;
  };
  const mhsDetail = () => listMahasiswa.find((m) => m.id === detailId);

  $("#dClose").addEventListener("click", tutupDetail);
  detailModal.addEventListener("click", (e) => { if (e.target === detailModal) tutupDetail(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") tutupDetail(); });

  $("#dEdit").addEventListener("click", () => {
    const mhs = mhsDetail();
    if (!mhs) return;
    tutupDetail();
    mulaiEdit(mhs);
  });
  $("#dHapus").addEventListener("click", () => {
    const mhs = mhsDetail();
    if (!mhs) return;
    tutupDetail();
    hapusMahasiswa(mhs);
  });
  $("#dSalin").addEventListener("click", async () => {
    const mhs = mhsDetail();
    if (!mhs) return;
    try {
      await navigator.clipboard.writeText(mhs.email);
      showAlert("Email berhasil disalin");
    } catch (err) {
      showAlert("Gagal menyalin email", "error");
    }
  });

  // ---------- Klik pada tabel (event delegation) ----------
  mhsTableBody.addEventListener("click", (e) => {
    const el = e.target.closest("[data-aksi]");
    if (!el) return;
    const mhs = listMahasiswa.find((m) => m.id === Number(el.dataset.id));
    if (!mhs) return;

    if (el.dataset.aksi === "detail") bukaDetail(mhs);
    else if (el.dataset.aksi === "edit") mulaiEdit(mhs);
    else if (el.dataset.aksi === "delete") hapusMahasiswa(mhs);
  });

  // ---------- Filter program studi ----------
  chipBox.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip-filter");
    if (!chip) return;
    prodiAktif = chip.dataset.kunci;
    renderChips();
    terapkanFilter();
  });

  // ---------- Reset form ----------
  const resetForm = () => {
    mhsForm.reset();
    mhsIdInput.value = "";
    formTitle.textContent = "Tambah Mahasiswa Baru";
    modeChip.textContent = "Mode Tambah";
    modeChip.classList.remove("edit");
    btnSubmit.textContent = "Simpan Mahasiswa";
    btnCancel.hidden = true;
  };
  btnCancel.addEventListener("click", resetForm);

  // Fitur 1: event 'input' pada kolom pencarian
  searchInput.addEventListener("input", terapkanFilter);

  // ---------- Tombol navigasi / hero ----------
  const keForm = () => {
    $("#tambah").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => nimInput.focus({ preventScroll: true }), 600);
  };
  $("#navTambah").addEventListener("click", keForm);
  $("#heroTambah").addEventListener("click", keForm);
  $("#heroLihat").addEventListener("click", () => $("#data").scrollIntoView({ behavior: "smooth" }));

  // Ambil data pertama kali
  loadMahasiswa();
});