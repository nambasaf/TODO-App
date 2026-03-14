from flask import Flask
from flask_cors import CORS
from database import init_db
from routes.auth_routes import auth_bp
from routes.task_routes import tasks_bp

def create_app():
    app = Flask(__name__)
    
    # Enable CORS for the frontend
    CORS(app)
    
    # Initialize DB
    init_db()
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(tasks_bp, url_prefix='/api')
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
