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
    app.config.update({"TESTING": True})
    
    yield app
    
    if os.path.exists(db_path):
        os.remove(db_path)

@pytest.fixture
def client(app):
    return app.test_client()

def test_register_user_success(client):
    response = client.post('/api/register', json={
        "name": "Faith",
        "email": "faith@example.com",
        "password": "mypassword"
    })
    data = response.get_json()
    assert response.status_code == 201
    assert data["status"] == "success"
    assert "user_id" in data

def test_register_duplicate_email_fails(client):
    client.post('/api/register', json={
        "name": "Faith",
        "email": "faith@example.com",
        "password": "mypassword"
    })
    response = client.post('/api/register', json={
        "name": "Faith Clone",
        "email": "faith@example.com",
        "password": "otherpassword"
    })
    data = response.get_json()
    assert response.status_code == 400
    assert data["status"] == "error"
    assert data["message"] == "Email already exists"

def test_login_success_returns_jwt(client):
    client.post('/api/register', json={
        "name": "Faith",
        "email": "faith@example.com",
        "password": "mypassword"
    })
    response = client.post('/api/login', json={
        "email": "faith@example.com",
        "password": "mypassword"
    })
    data = response.get_json()
    assert response.status_code == 200
    assert data["status"] == "success"
    assert "token" in data

def test_login_invalid_password_fails(client):
    client.post('/api/register', json={
        "name": "Faith",
        "email": "faith@example.com",
        "password": "mypassword"
    })
    response = client.post('/api/login', json={
        "email": "faith@example.com",
        "password": "wrongpassword"
    })
    data = response.get_json()
    assert response.status_code == 401
    assert data["status"] == "error"
    assert data["message"] == "Invalid credentials"

def test_login_invalid_email_fails(client):
    response = client.post('/api/login', json={
        "email": "nobody@example.com",
        "password": "mypassword"
    })
    data = response.get_json()
    assert response.status_code == 401
    assert data["status"] == "error"
    assert data["message"] == "Invalid credentials"
