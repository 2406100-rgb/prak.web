
const defaultProjects = [
    {
        id: 1,
        title: "Website Portofolio",
        category: "Web App",
        description: "Website untuk memperkenalkan profil diri, menampilkan informasi, dan memamerkan hasil proyek.",
        technologies: "HTML, CSS, JavaScript",
        budget: 2500000,
        completed: true
    },
    {
        id: 2,
        title: "Sistem Pengelolaan Data Barang",
        category: "Web App",
        description: "Aplikasi untuk membantu pencatatan, pengelolaan, dan pemantauan data barang.",
        technologies: "HTML, CSS, JavaScript, PHP",
        budget: 5000000,
        completed: false
    },
    {
        id: 3,
        title: "Sistem Kasir Sederhana",
        category: "Desktop App",
        description: "Aplikasi sederhana untuk membantu pencatatan transaksi dan perhitungan total belanja.",
        technologies: "Sesuaikan dengan teknologi yang digunakan",
        budget: 1500000,
        completed: false
    }
];

const STORAGE_KEY = "kakaPortfolioProjects";

const loadProjects = () => {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);

        if (savedData !== null) {
            const parsedData = JSON.parse(savedData);

            if (Array.isArray(parsedData)) {
                return parsedData;
            }
        }
    } catch (error) {
        console.error("Data proyek gagal dibaca:", error);
    }

    return defaultProjects.map(project => ({ ...project }));
};

let projects = loadProjects();
let selectedCategory = "Semua";
let searchKeyword = "";

const saveProjects = () => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        return true;
    } catch (error) {
        console.error("Data proyek gagal disimpan:", error);
        alert("Data gagal disimpan. Periksa pengaturan penyimpanan browser.");
        return false;
    }
};

const formatRupiah = angka => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(angka);
};

const escapeHTML = text => {
    const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };

    return String(text ?? "").replace(/[&<>"']/g, char => entities[char]);
};

const updateStats = () => {
    const totalBudget = projects.reduce(
        (total, project) => total + Number(project.budget),
        0
    );

    const completedCount = projects.filter(
        project => project.completed
    ).length;

    document.getElementById("stat-total-projects").textContent =
        projects.length;

    document.getElementById("stat-total-budget").textContent =
        formatRupiah(totalBudget);

    document.getElementById("stat-completed-projects").textContent =
        completedCount;
};

const renderProjects = () => {
    const container = document.getElementById("project-list");

    const filteredProjects = projects.filter(project => {
        const matchesCategory =
            selectedCategory === "Semua" ||
            project.category === selectedCategory;

        const searchableText = [
            project.title,
            project.description,
            project.technologies
        ].join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(
            searchKeyword.toLowerCase()
        );

        return matchesCategory && matchesSearch;
    });

    if (filteredProjects.length === 0) {
        container.innerHTML = `
            <p class="empty-message">
                Belum ada proyek yang sesuai dengan pencarian.
            </p>
        `;
        return;
    }

    container.innerHTML = filteredProjects.map(project => {
        const statusClass = project.completed
            ? "badge-success"
            : "badge-pending";

        const statusText = project.completed
            ? "Selesai"
            : "Dalam Pengerjaan";

        return `
            <article class="project-card">
                <div>
                    <span class="project-category">
                        ${escapeHTML(project.category)}
                    </span>

                    <h3>${escapeHTML(project.title)}</h3>

                    <p class="project-description">
                        ${escapeHTML(project.description || "Belum ada deskripsi proyek.")}
                    </p>

                    <p class="tech-label">
                        Teknologi: ${escapeHTML(project.technologies || "Belum dicantumkan")}
                    </p>

                    <p class="project-budget">
                        Anggaran: ${formatRupiah(Number(project.budget))}
                    </p>
                </div>

                <div>
                    <span class="badge ${statusClass}">
                        ${statusText}
                    </span>
                </div>

                <div class="project-actions">
                    <button
                        type="button"
                        class="btn-status"
                        data-action="toggle"
                        data-id="${project.id}"
                    >
                        Ubah Status
                    </button>

                    <button
                        type="button"
                        class="btn-delete"
                        data-action="delete"
                        data-id="${project.id}"
                    >
                        Hapus
                    </button>
                </div>
            </article>
        `;
    }).join("");
};

const refreshDashboard = () => {
    updateStats();
    renderProjects();
};

document.addEventListener("DOMContentLoaded", () => {
    const projectForm = document.getElementById("project-form");
    const titleInput = document.getElementById("project-title");
    const categoryInput = document.getElementById("project-category");
    const descriptionInput = document.getElementById("project-description");
    const technologiesInput = document.getElementById("project-technologies");
    const budgetInput = document.getElementById("project-budget");
    const completedInput = document.getElementById("project-completed");
    const searchInput = document.getElementById("search-project");
    const projectList = document.getElementById("project-list");
    const filterButtons = document.querySelectorAll(".btn-filter");

    projectForm.addEventListener("submit", event => {
        event.preventDefault();

        const title = titleInput.value.trim();
        const category = categoryInput.value;
        const description = descriptionInput.value.trim();
        const technologies = technologiesInput.value.trim();
        const budgetText = budgetInput.value.trim();
        const budget = Number(budgetText);

        if (!title) {
            alert("Nama proyek harus diisi.");
            titleInput.focus();
            return;
        }

        if (
            budgetText === "" ||
            !Number.isFinite(budget) ||
            budget <= 0 ||
            !Number.isInteger(budget)
        ) {
            alert("Anggaran harus berupa angka bulat lebih dari 0.");
            budgetInput.focus();
            return;
        }

        const newProject = {
            id: Date.now(),
            title,
            category,
            description: description || "Deskripsi belum ditambahkan.",
            technologies: technologies || "Teknologi belum dicantumkan.",
            budget,
            completed: completedInput.checked
        };

        projects.push(newProject);

        if (!saveProjects()) {
            projects.pop();
            return;
        }

        projectForm.reset();
        selectedCategory = "Semua";
        searchKeyword = "";
        searchInput.value = "";

        filterButtons.forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.category === "Semua"
            );
        });

        refreshDashboard();
        alert("Proyek berhasil ditambahkan dan disimpan!");
    });

    searchInput.addEventListener("input", event => {
        searchKeyword = event.target.value.trim();
        renderProjects();
    });

    filterButtons.forEach(button => {
        button.addEventListener("click", event => {
            selectedCategory = event.currentTarget.dataset.category;

            filterButtons.forEach(item => {
                item.classList.toggle(
                    "active",
                    item === event.currentTarget
                );
            });

            renderProjects();
        });
    });

    projectList.addEventListener("click", event => {
        const button = event.target.closest("button[data-action]");

        if (!button) {
            return;
        }

        const projectId = Number(button.dataset.id);
        const action = button.dataset.action;

        if (action === "toggle") {
            const project = projects.find(
                item => item.id === projectId
            );

            if (project) {
                project.completed = !project.completed;

                if (saveProjects()) {
                    refreshDashboard();
                } else {
                    project.completed = !project.completed;
                }
            }
        }

        if (action === "delete") {
            const projectIndex = projects.findIndex(
                item => item.id === projectId
            );

            if (projectIndex !== -1) {
                const confirmed = confirm(
                    "Apakah kamu yakin ingin menghapus proyek ini?"
                );

                if (confirmed) {
                    const deletedProject = projects.splice(
                        projectIndex, 1
                    )[0];

                    if (saveProjects()) {
                        refreshDashboard();
                    } else {
                        projects.splice(projectIndex, 0, deletedProject);
                        refreshDashboard();
                    }
                }
            }
        }
    });

    refreshDashboard();
});
