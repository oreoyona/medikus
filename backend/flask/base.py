from flask import Flask, request, g
from flask_cors import CORS
from flask_login import LoginManager, current_user
from models import User, db

app = Flask(__name__)
app.config.from_object('config.DevConfig')  # Keep your config

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'loginUser'
login_manager.session_protection = "strong"

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

db.init_app(app)

# Configure CORS to allow requests from 'http://localhost:4200'
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:4200"]}})

@app.before_request
def before_request():
    g.current_user = current_user

# ... your routes ...

if __name__ == '__main__':
    app.run(debug=False)  # Run without debug mode