from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS
from config import DevConfig
from api.v1.api import api_v1
from models import db, init_db
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from limits.storage import MemoryStorage  # For fallback in case of issues

# Basic app initializations
app = Flask(__name__)
app.config.from_object(DevConfig)



# # Configure the limiter
# limiter = Limiter(
#     key_func=get_remote_address,
#     app=app,
#     storage=MemoryStorage()  # Temporarily use MemoryStorage
# )

# Initialize Migrate and CORS
migrate = Migrate(app=app, db=db)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:4200"]}})

# Initialize the database
init_db(app)

# Register API blueprint
app.register_blueprint(api_v1, url_prefix='/api/v1')

if __name__ == "__main__":
    app.run(debug=False)