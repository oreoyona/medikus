from flask_jwt_extended import JWTManager
from flask_marshmallow import Marshmallow
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=['pbkdf2_sha256'], deprecated="auto")
jwt = JWTManager()
ma = Marshmallow()