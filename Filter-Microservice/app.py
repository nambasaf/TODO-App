from flask import Flask, request, jsonify
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BACKEND_URL = "http://localhost:5000/api/tasks"

@app.route("/filter", methods=["GET"])
def filter_tasks():
    user_id = request.headers.get("X-User-Id")
    category = request.args.get("category")
    due_date = request.args.get("dueDate")

    if not user_id:
        return jsonify({"status": "error", "message": "Missing X-User-Id header"}), 400

    try:
        # Fetch all tasks for the user from the main backend
        response = requests.get(BACKEND_URL, headers={"X-User-Id": user_id})
        if response.status_code != 200:
            return jsonify({"status": "error", "message": "Failed to fetch tasks from backend"}), 500
        
        data = response.json()
        tasks = data.get("tasks", [])

        # Apply filters
        filtered_tasks = tasks
        if category:
            filtered_tasks = [t for t in filtered_tasks if t.get("category") == category]
        
        if due_date:
            filtered_tasks = [t for t in filtered_tasks if t.get("dueDate") == due_date]

        return jsonify({
            "status": "success",
            "tasks": filtered_tasks
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5003)
