const addTaskBtn = document.getElementById("add-task");
const taskInput = document.getElementById("new-task");
const taskList = document.getElementById("task-list");
const completedTasks = document.getElementById("completed-tasks");

function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === "") {
        alert("Please enter a task.");
        return;
    }
    const li = document.createElement("li");
    li.textContent = taskText;

    li.addEventListener("click", () => {
        li.classList.toggle("completed");
        if (li.classList.contains("completed")) {
            completedTasks.appendChild(li);
        } else {
            taskList.appendChild(li);
        }
    });

    taskList.appendChild(li);
    taskInput.value = "";
}

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        addTask();
    }
});