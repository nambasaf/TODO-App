const addTaskBtn = document.getElementById("add-task");
const taskInput = document.getElementById("new-task");
const taskList = document.getElementById("task-list");
const completedTasks = document.getElementById("completed-tasks");
const pendingCount = document.getElementById("pending-count");
const completedCount = document.getElementById("completed-count");

const confirmDialog = document.getElementById("confirm-dialog");
const btnYes = document.getElementById("btn-yes");
const btnNo = document.getElementById("btn-no");

const detailsDialog = document.getElementById("details-dialog");
const btnDetailsSave = document.getElementById("btn-details-save");
const btnDetailsCancel = document.getElementById("btn-details-cancel");
const inputDueDate = document.getElementById("task-due-date");
const inputLink = document.getElementById("task-link");
const inputLocation = document.getElementById("task-location");

let taskToComplete = null;
let currentEditTask = null;

btnYes.addEventListener("click", () => {
    if (taskToComplete) {
        taskToComplete.classList.add("completed");
        completedTasks.appendChild(taskToComplete);
        updateCounts();
        taskToComplete = null;
    }
    confirmDialog.classList.add("hidden");
});

btnNo.addEventListener("click", () => {
    taskToComplete = null;
    confirmDialog.classList.add("hidden");
});

btnDetailsCancel.addEventListener("click", () => {
    currentEditTask = null;
    detailsDialog.classList.add("hidden");
});

btnDetailsSave.addEventListener("click", () => {
    if (currentEditTask) {
        currentEditTask.dataset.dueDate = inputDueDate.value;
        currentEditTask.dataset.link = inputLink.value;
        currentEditTask.dataset.location = inputLocation.value;
    }
    currentEditTask = null;
    detailsDialog.classList.add("hidden");
});

function updateCounts() {
    pendingCount.textContent = taskList.children.length;
    completedCount.textContent = completedTasks.children.length;
}

function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === "") {
        alert("Please enter a task.");
        return;
    }
    const li = document.createElement("li");
    li.innerHTML = `<span>${taskText}</span>`;

    const moreBtn = document.createElement("button");
    moreBtn.className = "more-btn";
    moreBtn.innerHTML = "⋮";
    moreBtn.title = "View/Edit Details";
    moreBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // prevent clicking the li (which toggles completion)
        currentEditTask = li;
        inputDueDate.value = li.dataset.dueDate || "";
        inputLink.value = li.dataset.link || "";
        inputLocation.value = li.dataset.location || "";
        detailsDialog.classList.remove("hidden");
    });
    li.appendChild(moreBtn);

    li.addEventListener("click", () => {
        if (!li.classList.contains("completed")) {
            taskToComplete = li;
            confirmDialog.classList.remove("hidden");
        } else {
            li.classList.remove("completed");
            taskList.appendChild(li);
            updateCounts();
        }
    });

    taskList.appendChild(li);
    taskInput.value = "";
    updateCounts();
}

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        addTask();
    }
});

// Initial count
updateCounts();