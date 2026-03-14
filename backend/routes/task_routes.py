from flask import Blueprint, request, jsonify
from database import create_task, get_task, update_task_status, get_user_tasks

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/tasks', methods=['POST'])
def create_task_endpoint():
    user_id = request.headers.get('X-User-Id')
    if not user_id:
        return jsonify({"status": "error", "message": "Missing X-User-Id header"}), 400
    
    try:
        user_id = int(user_id)
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid X-User-Id header"}), 400

    data = request.get_json()
    if not data or 'title' not in data:
        return jsonify({"status": "error", "message": "Missing required field: title"}), 400

    title = data['title']
    due_date = data.get('dueDate')
    link = data.get('link')
    location = data.get('location')
    category = data.get('category')

    task_id = create_task(user_id, title, due_date, link, location, category)

    return jsonify({
        "status": "success",
        "task_id": task_id
    }), 201

@tasks_bp.route('/tasks', methods=['GET'])
def get_tasks_endpoint():
    user_id = request.headers.get('X-User-Id')
    if not user_id:
        return jsonify({"status": "error", "message": "Missing X-User-Id header"}), 400
    
    try:
        user_id = int(user_id)
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid X-User-Id header"}), 400

    tasks = get_user_tasks(user_id)
    task_list = []
    for task in tasks:
        task_list.append({
            "id": task["id"],
            "title": task["title"],
            "dueDate": task["due_date"],
            "link": task["link"],
            "location": task["location"],
            "status": task["status"],
            "category": task["category"]
        })

    return jsonify({
        "status": "success",
        "tasks": task_list
    }), 200

@tasks_bp.route('/tasks/<int:task_id>', methods=['PATCH'])
def update_task_endpoint(task_id):
    user_id = request.headers.get('X-User-Id')
    if not user_id:
        return jsonify({"status": "error", "message": "Missing X-User-Id header"}), 400

    try:
        user_id = int(user_id)
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid X-User-Id header"}), 400

    data = request.get_json()
    if not data:
        return jsonify({"status": "error", "message": "Missing request body"}), 400

    task = get_task(task_id)
    if not task:
        return jsonify({"status": "error", "message": "Task not found"}), 404

    if task['user_id'] != user_id:
        return jsonify({"status": "error", "message": "Forbidden: Task belongs to another user"}), 403

    # Handle status update
    if 'status' in data:
        status = data['status']
        valid_statuses = ['pending', 'completed']
        if status in valid_statuses:
            from database import update_task_status
            update_task_status(task_id, status)
    
    # Handle details update
    if any(k in data for k in ['dueDate', 'link', 'location']):
        # If any detail is provided, update them (using current values as defaults if not in data)
        due_date = data.get('dueDate', task['due_date'])
        link = data.get('link', task['link'])
        location = data.get('location', task['location'])
        from database import update_task_details
        update_task_details(task_id, due_date, link, location)

    return jsonify({
        "status": "success",
        "message": "Task updated"
    }), 200
