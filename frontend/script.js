// API Configuration
const API_BASE = "http://192.168.0.103:5000/api";
const CAT_API_BASE = "http://localhost:5002";
const FILTER_API_BASE = "http://localhost:5003";

// Elements - Auth
const authSection = document.getElementById("auth-section");
const mainApp = document.getElementById("main-app");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const authError = document.getElementById("auth-error");
const showRegister = document.getElementById("show-register");
const showLogin = document.getElementById("show-login");

// Elements - App Nav
const navBtns = document.querySelectorAll(".nav-btn");
const tasksView = document.getElementById("tasks-view");
const categoriesView = document.getElementById("categories-view");

// Elements - Filter
const filterSearch = document.getElementById("filter-search");
const filterCategory = document.getElementById("filter-category");

// Elements - App
const addTaskBtn = document.getElementById("add-task");
const taskInput = document.getElementById("new-task");
const taskList = document.getElementById("task-list");
const completedTasks = document.getElementById("completed-tasks");
const pendingCount = document.getElementById("pending-count");
const completedCount = document.getElementById("completed-count");
const btnLogout = document.getElementById("btn-logout");

const confirmDialog = document.getElementById("confirm-dialog");
const btnYes = document.getElementById("btn-yes");
const btnNo = document.getElementById("btn-no");

const detailsDialog = document.getElementById("details-dialog");
const btnDetailsSave = document.getElementById("btn-details-save");
const btnDetailsCancel = document.getElementById("btn-details-cancel");
const inputDueDate = document.getElementById("task-due-date");
const inputLink = document.getElementById("task-link");
const inputLocation = document.getElementById("task-location");

// State
let taskToComplete = null;
let currentEditTask = null;
let userToken = localStorage.getItem("userToken");
let userId = localStorage.getItem("userId");

// --- View Logic ---

navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const view = btn.dataset.view;
        navBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        if (view === "tasks") {
            tasksView.classList.remove("hidden");
            categoriesView.classList.add("hidden");
            fetchTasks();
        } else {
            tasksView.classList.add("hidden");
            categoriesView.classList.remove("hidden");
        }
    });
});

// Elements - Category Modal
const catTasksModal = document.getElementById("category-tasks-modal");
const catModalTitle = document.getElementById("cat-modal-title");
const catTasksList = document.getElementById("cat-tasks-list");
const btnCatModalClose = document.getElementById("btn-cat-modal-close");

// Category Card Clicks
document.querySelectorAll(".category-card").forEach(card => {
    card.addEventListener("click", () => {
        const category = card.dataset.category;
        showCategoryTasks(category);
    });
});

async function showCategoryTasks(category) {
    catModalTitle.textContent = `${category} Tasks`;
    catTasksList.innerHTML = "<p style='text-align:center; padding: 2rem;'>Loading tasks...</p>";
    catTasksModal.classList.remove("hidden");

    try {
        const url = `${FILTER_API_BASE}/filter?category=${category}`;
        const res = await fetch(url, {
            headers: { "X-User-Id": userId }
        });
        const data = await res.json();
        
        if (data.status === "success") {
            catTasksList.innerHTML = "";
            if (data.tasks.length === 0) {
                catTasksList.innerHTML = "<p style='text-align:center; padding: 2rem; color: var(--text-muted);'>No tasks found for this category.</p>";
                return;
            }
            
            data.tasks.forEach(task => {
                const li = document.createElement("li");
                li.className = "cat-task-item";
                
                // Details HTML
                let detailsHtml = "";
                if (task.dueDate) detailsHtml += `<span><i class="far fa-calendar-alt"></i> ${task.dueDate}</span>`;
                if (task.link) detailsHtml += `<span><i class="fas fa-link"></i> <a href="${task.link}" target="_blank" style="color: var(--primary); text-decoration: none;">Link</a></span>`;
                if (task.location) detailsHtml += `<span><i class="fas fa-map-marker-alt"></i> ${task.location}</span>`;

                li.innerHTML = `
                    <h4>${task.title}</h4>
                    <div class="cat-task-details">
                        ${detailsHtml || "<span style='opacity: 0.5;'>No extra details saved.</span>"}
                    </div>
                `;
                catTasksList.appendChild(li);
            });
        }
    } catch (err) {
        catTasksList.innerHTML = "<p style='text-align:center; color: var(--error);'>Failed to load tasks.</p>";
    }
}

btnCatModalClose.addEventListener("click", () => {
    catTasksModal.classList.add("hidden");
});

// --- Auth Functions ---

function toggleAuthView(view) {
    if (view === "register") {
        loginForm.classList.add("hidden");
        registerForm.classList.remove("hidden");
        document.getElementById("auth-title").textContent = "Create Account";
        document.getElementById("auth-subtitle").textContent = "Join us to stay organized";
    } else {
        registerForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
        document.getElementById("auth-title").textContent = "Welcome back";
        document.getElementById("auth-subtitle").textContent = "Sign in to manage your tasks";
    }
    authError.classList.add("hidden");
}

async function handleLogin() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const res = await fetch(`${API_BASE}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (data.status === "success") {
            const payload = JSON.parse(atob(data.token.split('.')[1]));
            localStorage.setItem("userToken", data.token);
            localStorage.setItem("userId", payload.user_id);
            userToken = data.token;
            userId = payload.user_id;
            showApp();
        } else {
            showError(data.message || "Login failed");
        }
    } catch (err) {
        showError("Server error. Is the backend running?");
    }
}

async function handleRegister() {
    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    try {
        const res = await fetch(`${API_BASE}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();

        if (data.status === "success") {
            alert("Registration successful! Please login.");
            toggleAuthView("login");
        } else {
            showError(data.message || "Registration failed");
        }
    } catch (err) {
        showError("Server error. Is the backend running?");
    }
}

function showError(msg) {
    authError.textContent = msg;
    authError.classList.remove("hidden");
}

function showApp() {
    authSection.classList.add("hidden");
    mainApp.classList.remove("hidden");
    fetchTasks();
}

function logout() {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    userToken = null;
    userId = null;
    mainApp.classList.add("hidden");
    authSection.classList.remove("hidden");
    taskList.innerHTML = "";
    completedTasks.innerHTML = "";
    updateCounts();
}

// --- Task & Filter Functions ---

async function fetchTasks() {
    const category = filterCategory.value;
    const search = filterSearch.value.toLowerCase();
    
    let url = `${API_BASE}/tasks`;
    
    // If we have a category, we use the Filter Microservice (Port 5003)
    if (category) {
        url = `${FILTER_API_BASE}/filter?category=${category}`;
    }

    try {
        const res = await fetch(url, {
            headers: { "X-User-Id": userId }
        });
        const data = await res.json();
        if (data.status === "success") {
            taskList.innerHTML = "";
            completedTasks.innerHTML = "";
            
            // Apply local search filter on top
            data.tasks.filter(t => t.title.toLowerCase().includes(search))
                     .forEach(task => renderTask(task));
            
            updateCounts();
        }
    } catch (err) {
        console.error("Failed to fetch or filter tasks", err);
    }
}

filterCategory.addEventListener("change", fetchTasks);
filterSearch.addEventListener("input", fetchTasks);

function renderTask(task) {
    const li = document.createElement("li");
    li.dataset.id = task.id;
    li.dataset.dueDate = task.dueDate || "";
    li.dataset.link = task.link || "";
    li.dataset.location = task.location || "";
    li.dataset.category = task.category || "";

    const categoryHtml = task.category ? `<span class="category-badge cat-${task.category.toLowerCase()}">${task.category}</span>` : "";
    li.innerHTML = `<span>${task.title}${categoryHtml}</span>`;

    const moreBtn = document.createElement("button");
    moreBtn.className = "more-btn";
    moreBtn.innerHTML = "⋮";
    moreBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        currentEditTask = li;
        inputDueDate.value = li.dataset.dueDate;
        inputLink.value = li.dataset.link;
        inputLocation.value = li.dataset.location;
        detailsDialog.classList.remove("hidden");
    });
    li.appendChild(moreBtn);

    li.addEventListener("click", () => {
        if (!li.classList.contains("completed")) {
            taskToComplete = li;
            confirmDialog.classList.remove("hidden");
        } else {
            updateTaskStatusOnBackend(task.id, "pending", li);
        }
    });

    if (task.status === "completed") {
        li.classList.add("completed");
        completedTasks.appendChild(li);
    } else {
        taskList.appendChild(li);
    }
}

async function addTask() {
    const title = taskInput.value.trim();
    if (!title) return;

    let category = "Default";
    try {
        const catRes = await fetch(`${CAT_API_BASE}/categorize`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title })
        });
        const catData = await catRes.json();
        if (catData.status === "success") {
            category = catData.category;
        }
    } catch (err) {
        console.warn("Categorization service unavailable, using default", err);
    }

    try {
        const res = await fetch(`${API_BASE}/tasks`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "X-User-Id": userId
            },
            body: JSON.stringify({ title, category })
        });
        const data = await res.json();
        if (data.status === "success") {
            renderTask({
                id: data.task_id,
                title,
                status: "pending",
                category
            });
            taskInput.value = "";
            updateCounts();
        }
    } catch (err) {
        alert("Failed to save task to database");
    }
}

async function updateTaskStatusOnBackend(taskId, status, element) {
    try {
        const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: "PATCH",
            headers: { 
                "Content-Type": "application/json",
                "X-User-Id": userId
            },
            body: JSON.stringify({ status })
        });
        if (res.ok) {
            if (status === "completed") {
                element.classList.add("completed");
                completedTasks.appendChild(element);
            } else {
                element.classList.remove("completed");
                taskList.appendChild(element);
            }
            updateCounts();
        }
    } catch (err) {
        alert("Failed to update status on server");
    }
}

// --- Event Listeners ---

showRegister.addEventListener("click", (e) => { e.preventDefault(); toggleAuthView("register"); });
showLogin.addEventListener("click", (e) => { e.preventDefault(); toggleAuthView("login"); });
document.getElementById("btn-login").addEventListener("click", handleLogin);
document.getElementById("btn-register").addEventListener("click", handleRegister);
btnLogout.addEventListener("click", logout);

addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addTask(); });

btnYes.addEventListener("click", () => {
    if (taskToComplete) {
        updateTaskStatusOnBackend(taskToComplete.dataset.id, "completed", taskToComplete);
        taskToComplete = null;
    }
    confirmDialog.classList.add("hidden");
});

btnNo.addEventListener("click", () => {
    taskToComplete = null;
    confirmDialog.classList.add("hidden");
});

btnDetailsSave.addEventListener("click", async () => {
    console.log("Save button clicked");
    if (!currentEditTask) {
        console.error("No task selected for editing");
        return;
    }
    
    const taskId = currentEditTask.dataset.id;
    const dueDate = inputDueDate.value;
    const link = inputLink.value;
    const location = inputLocation.value;

    console.log("Saving task:", taskId, { dueDate, link, location });

    try {
        const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: "PATCH",
            headers: { 
                "Content-Type": "application/json",
                "X-User-Id": userId
            },
            body: JSON.stringify({ dueDate, link, location })
        });
        
        if (res.ok) {
            console.log("Details saved successfully");
            // Update UI/Dataset
            currentEditTask.dataset.dueDate = dueDate;
            currentEditTask.dataset.link = link;
            currentEditTask.dataset.location = location;
            
            // Re-render or just close
            detailsDialog.classList.add("hidden");
            currentEditTask = null;
        } else {
            console.error("Save failed with status:", res.status);
            alert("Failed to save details to server");
        }
    } catch (err) {
        alert("Error connecting to server");
    }
});

btnDetailsCancel.addEventListener("click", () => {
    currentEditTask = null;
    detailsDialog.classList.add("hidden");
});

function updateCounts() {
    pendingCount.textContent = taskList.children.length;
    completedCount.textContent = completedTasks.children.length;
}

// Init
if (userToken && userId) {
    showApp();
} else {
    authSection.classList.remove("hidden");
}
updateCounts();