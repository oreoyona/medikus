from datetime import timedelta
import os
import secrets



class Config(object):
    """ Defines the Configuration class file"""

    SECRET_KEY = os.environ.get("JWT_SECRET_KEY")

    basedir = os.path.abspath(os.path.dirname(__file__))
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:1234@localhost:5432/postgres'
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_IDENTITY_CLAIM = "user_id" #default = sub
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)
    SQLAlCHEMY_TRACK_MODIFICATIONS = False



class DevConfig(Config):
    """ Defines the developpement configuration object"""
    DATABASE_URI = "postgresql://postgres:1234@localhost:5432/postgres"
    DEBUG = True
