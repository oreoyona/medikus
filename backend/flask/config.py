import os
import secrets



class Config(object):
    """ Defines the Configuration class file"""

    SECRET_KEY = secrets.token_hex(32)

    basedir = os.path.abspath(os.path.dirname(__file__))

    ELEPHANTSQL_DATABASE_URI = 'postgres://qydprjod:VNbjOitCgkQKe6OdX7RiaLWygJJ2hZZD@surus.db.elephantsql.com/qydprjod'
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:1234@localhost:5432/postgres'

    SQLAlCHEMY_TRACK_MODIFICATIONS = False

class DevConfig(Config):
    """ Defines the developpement configuration object"""
    DATABASE_URI = "postgresql://postgres:1234@localhost:5432/postgres"
    DEBUG = True
