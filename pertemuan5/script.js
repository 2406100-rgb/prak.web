// File: script.js
document.addEventListener("DOMContentLoaded", () => {
    // Batas maksimal jumlah tugas
    const MAX_TUGAS = 5;

    // 1. Ambil elemen DOM
    const todoForm = document.querySelector("#todoForm");
    const taskInput = document.querySelector("#taskInput");
    const inputError = document.querySelector("#inputError");
    const todoList = document.querySelector("#todoList");
    const taskCounter = document.querySelector("#taskCounter");
    const clearCompletedBtn = document.querySelector("#clearCompletedBtn");

    // 2. Fungsi membaca dan menyimpan ke LocalStorage
    const getTasks = () => JSON.parse(localStorage.getItem("todo_tasks")) || [];
    const saveTasks = (tasks) => localStorage.setItem("todo_tasks", JSON.stringify(tasks));

    // Fitur 1: perbarui penghitung jumlah tugas
    const updateCounter = (tasks) => {
        const total = tasks.length;
        const selesai = tasks.filter((task) => task.completed).length;
        const belum = total - selesai;
        taskCounter.textContent = `Total: ${total} Tugas | Selesai: ${selesai} | Belum Selesai: ${belum}`;
    };

    // 3. Fungsi menampilkan daftar tugas ke layar
    const renderTasks = () => {
        const tasks = getTasks();
        todoList.innerHTML = "";
        updateCounter(tasks);

        if (tasks.length === 0) {
            todoList.innerHTML = "<p style='text-align:center; color:#64748b; font-size:13px; padding:10px;'>Belum ada tugas tersimpan.</p>";
            return;
        }

        tasks.forEach((task, index) => {
            const li = document.createElement("li");
            li.className = `todo-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <span class="todo-text">${task.text}</span>
                <div class="todo-actions">
                    <button class="action-btn complete-btn" data-index="${index}">
                        ${task.completed ? 'Batal' : 'Selesai'}
                    </button>
                    <button class="action-btn delete-btn" data-index="${index}">Hapus</button>
                </div>
            `;
            todoList.appendChild(li);
        });
    };

    // Sembunyikan pesan error
    const hideError = () => {
        taskInput.classList.remove("error");
        inputError.style.display = "none";
    };

    // 4. Tambah tugas saat formulir dikirim
    todoForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const taskText = taskInput.value.trim();
        const tasks = getTasks();

        // Validasi input sederhana
        if (taskText.length < 3) {
            inputError.textContent = "Tugas tidak boleh kosong atau kurang dari 3 karakter!";
            taskInput.classList.add("error");
            inputError.style.display = "block";
            return;
        }

        // Batasan maksimal lima tugas
        if (tasks.length >= MAX_TUGAS) {
            inputError.textContent = "Tugas maksimal lima!";
            taskInput.classList.add("error");
            inputError.style.display = "block";
            return;
        }

        // Jika valid, hilangkan pesan error
        hideError();

        // Simpan tugas baru ke array LocalStorage
        tasks.push({ text: taskText, completed: false });
        saveTasks(tasks);

        taskInput.value = "";
        renderTasks();
    });

    // 5. Tangani klik tombol Selesai dan Hapus menggunakan Event Listener pada todoList
    todoList.addEventListener("click", (e) => {
        const index = e.target.dataset.index;
        if (index === undefined) return;

        const tasks = getTasks();

        if (e.target.classList.contains("complete-btn")) {
            tasks[index].completed = !tasks[index].completed;
            saveTasks(tasks);
            renderTasks();
        } else if (e.target.classList.contains("delete-btn")) {
            // Fitur 3: konfirmasi sebelum menghapus
            if (confirm("Apakah Anda yakin ingin menghapus tugas ini?")) {
                tasks.splice(index, 1);
                saveTasks(tasks);
                renderTasks();
                hideError();
            }
        }
    });

    // Fitur 2: hapus hanya tugas yang sudah selesai (dengan konfirmasi)
    clearCompletedBtn.addEventListener("click", () => {
        const tasks = getTasks();
        const jumlahSelesai = tasks.filter((task) => task.completed).length;

        // Jika belum ada tugas selesai, beri tahu pengguna
        if (jumlahSelesai === 0) {
            alert("Belum ada tugas yang selesai untuk dibersihkan.");
            return;
        }

        // Konfirmasi sebelum membersihkan
        if (confirm(`Apakah Anda yakin ingin menghapus ${jumlahSelesai} tugas yang sudah selesai?`)) {
            const sisa = tasks.filter((task) => !task.completed);
            saveTasks(sisa);
            renderTasks();
            hideError();
        }
    });

    // Render pertama kali saat halaman selesai dimuat
    renderTasks();
});