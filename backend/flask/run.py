from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS
from config import DevConfig
from api.v1.api import api_v1
from models import db, init_db

app = Flask(__name__)
app.config.from_object(DevConfig)
migrate = Migrate(app=app, db=db)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:4200"]}})

init_db(app)

app.register_blueprint(api_v1, url_prefix='/api/v1')

if __name__ == "__main__":
    app.run(debug=False)