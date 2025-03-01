from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS
from config import DevConfig
from models import db, init_db
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from limits.storage import MemoryStorage  # For fallback in case of issues
from api.v1.api import api_v1
from api.v1 import jwt
from auth.views import auth_bp
from dotenv import load_dotenv
# Basic app initializations

load_dotenv()
app = Flask(__name__)
app.config.from_object(DevConfig)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:4200"]}})
jwt.init_app(app)
# Register API blueprint
app.register_blueprint(api_v1, url_prefix='/api/v1')
app.register_blueprint(auth_bp)


# # Configure the limiter
# limiter = Limiter(
#     key_func=get_remote_address,
#     app=app,
#     storage=MemoryStorage()  # Temporarily use MemoryStorage
# )

# Initialize Migrate and CORS
migrate = Migrate(app=app, db=db)

# Initialize the database
init_db(app)


if __name__ == "__main__":
    app.run(debug=False)
