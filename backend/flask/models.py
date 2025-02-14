import datetime
from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from werkzeug.security import generate_password_hash, check_password_hash
from pytz import timezone


db = SQLAlchemy()

def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()


class Course(db.Model):
    __tablename__ = 'courses'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(tz=timezone('UTC')))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(tz=timezone('UTC')))
    instructor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    instructor = db.relationship('User', backref='courses', lazy='joined')
    participants = db.relationship('Enrollment', backref='course', lazy='dynamic')

    def __repr__(self):
        return f"<Course(id={self.id}, title='{self.title}')>"

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password = db.Column(db.String(100), nullable=False)
    is_instructor = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(tz=timezone('UTC')))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(tz=timezone('UTC')))

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"

class Enrollment(db.Model):
    __tablename__ = 'enrollments'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    enrolled_at = db.Column(db.DateTime, default=lambda: datetime.now(tz=timezone('UTC')))
    completed = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f"<Enrollment(id={self.id}, user_id={self.user_id}, course_id={self.course_id})>"