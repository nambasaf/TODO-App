const addTaskBtn = document.getElementById("add-task");
const taskInput = document.getElementById("new-task");
const taskList = document.getElementById("task-list");
const completedTasks = document.getElementById("completed-tasks");
const pendingCount = document.getElementById("pending-count");
const completedCount = document.getElementById("completed-count");

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

    li.addEventListener("click", () => {
        li.classList.toggle("completed");
        if (li.classList.contains("completed")) {
            completedTasks.appendChild(li);
        } else {
            taskList.appendChild(li);
        }
        updateCounts();
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