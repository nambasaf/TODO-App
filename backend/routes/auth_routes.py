import bcrypt
import jwt
import datetime
from flask import Blueprint, request, jsonify
from database import create_user, get_user_by_email

auth_bp = Blueprint('auth', __name__)
SECRET_KEY = 'super-secret-developer-key'

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or 'name' not in data or 'email' not in data or 'password' not in data:
        return jsonify({"status": "error", "message": "Missing required fields"}), 400

    name = data['name']
    email = data['email']
    password = data['password']

    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    user_id, error = create_user(name, email, password_hash)
    
    if error:
        return jsonify({"status": "error", "message": error}), 400

    return jsonify({
        "status": "success",
        "user_id": user_id
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"status": "error", "message": "Missing required fields"}), 400

    email = data['email']
    password = data['password']

    user = get_user_by_email(email)
    
    if user is None or not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        return jsonify({
            "status": "error",
            "message": "Invalid credentials"
        }), 401

    payload = {
        'user_id': user['id'],
        'email': user['email'],
        'exp': datetime.datetime.now(datetime.UTC) + datetime.timedelta(hours=1)
    }
    
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')

    return jsonify({
        "status": "success",
        "token": token
    }), 200
