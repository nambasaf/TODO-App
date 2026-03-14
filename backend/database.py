import sqlite3
import os

DATABASE_URL = os.path.join(os.path.dirname(__file__), 'todo.db')

def get_db_connection():
    conn = sqlite3.connect(DATABASE_URL)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    # Create Users Table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        );
    ''')
    
    # Create Tasks Table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            due_date TEXT,
            link TEXT,
            location TEXT,
            status TEXT DEFAULT 'pending',
            category TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
    ''')
    conn.commit()
    conn.close()

# --- User Database Functions ---
def create_user(name, email, password_hash):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO users (name, email, password_hash)
            VALUES (?, ?, ?)
        ''', (name, email, password_hash))
        conn.commit()
        user_id = cursor.lastrowid
        return user_id, None
    except sqlite3.IntegrityError:
        return None, "Email already exists"
    finally:
        conn.close()

def get_user_by_email(email):
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    conn.close()
    return user

# --- Task Database Functions ---
def create_task(user_id, title, due_date, link, location, category=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO tasks (user_id, title, due_date, link, location, category)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (user_id, title, due_date, link, location, category))
    conn.commit()
    task_id = cursor.lastrowid
    conn.close()
    return task_id

def get_user_tasks(user_id):
    conn = get_db_connection()
    tasks = conn.execute('SELECT * FROM tasks WHERE user_id = ?', (user_id,)).fetchall()
    conn.close()
    return tasks

def get_task(task_id):
    conn = get_db_connection()
    task = conn.execute('SELECT * FROM tasks WHERE id = ?', (task_id,)).fetchone()
    conn.close()
    return task

def update_task_status(task_id, status):
    conn = get_db_connection()
    conn.execute('''
        UPDATE tasks SET status = ? WHERE id = ?
    ''', (status, task_id))
    conn.commit()
    conn.close()

def update_task_details(task_id, due_date, link, location):
    conn = get_db_connection()
    conn.execute('''
        UPDATE tasks 
        SET due_date = ?, link = ?, location = ?
        WHERE id = ?
    ''', (due_date, link, location, task_id))
    conn.commit()
    conn.close()
