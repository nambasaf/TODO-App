import pytest
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
import database

@pytest.fixture
def app():
    # Use a test database
    db_path = os.path.join(os.path.dirname(__file__), 'test_todo.db')
    database.DATABASE_URL = db_path
    
    app = create_app()
    app.config.update({
        "TESTING": True,
    })
    
    # Needs to initialize tables, ensure it's called
    with app.app_context():
        database.init_db()
        # Seed a user to own tasks
        database.create_user("Test User", "test@example.com", "hash")

    yield app
    
    # Teardown
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
        except OSError:
            pass

@pytest.fixture
def client(app):
    return app.test_client()

def test_create_task(client):
    response = client.post('/api/tasks', headers={'X-User-Id': '1'}, json={
        "title": "Study CS361",
        "dueDate": "2026-03-20",
        "link": "Canvas",
        "location": "Library"
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['status'] == 'success'
    assert 'task_id' in data

def test_create_task_missing_title(client):
    response = client.post('/api/tasks', headers={'X-User-Id': '1'}, json={
        "dueDate": "2026-03-20"
    })
    assert response.status_code == 400
    assert response.get_json()['status'] == 'error'

def test_update_success(client):
    # First create a task
    create_response = client.post('/api/tasks', headers={'X-User-Id': '1'}, json={
        "title": "Learn Flask"
    })
    task_id = create_response.get_json()['task_id']
    
    # Update status
    response = client.patch(f'/api/tasks/{task_id}', headers={'X-User-Id': '1'}, json={
        "status": "completed"
    })
    assert response.status_code == 200
    assert response.get_json()['status'] == 'success'
    assert response.get_json()['message'] == 'Task updated'

def test_task_not_found(client):
    response = client.patch('/api/tasks/999', headers={'X-User-Id': '1'}, json={
        "status": "completed"
    })
    assert response.status_code == 404
    assert response.get_json()['status'] == 'error'
    assert response.get_json()['message'] == 'Task not found'

def test_wrong_user(client):
    # Create with user 1
    create_response = client.post('/api/tasks', headers={'X-User-Id': '1'}, json={
        "title": "Learn Flask"
    })
    task_id = create_response.get_json()['task_id']

    # Update with user 2
    response = client.patch(f'/api/tasks/{task_id}', headers={'X-User-Id': '2'}, json={
        "status": "completed"
    })
    assert response.status_code == 403
    assert response.get_json()['status'] == 'error'
    assert response.get_json()['message'] == 'Forbidden: Task belongs to another user'

def test_invalid_status(client):
    create_response = client.post('/api/tasks', headers={'X-User-Id': '1'}, json={
        "title": "Learn Flask"
    })
    task_id = create_response.get_json()['task_id']

    response = client.patch(f'/api/tasks/{task_id}', headers={'X-User-Id': '1'}, json={
        "status": "unknown_status"
    })
    assert response.status_code == 400
    assert response.get_json()['status'] == 'error'
    assert response.get_json()['message'] == 'Invalid status'
