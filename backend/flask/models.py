import datetime
from flask_jwt_extended import JWTManager
from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from pygments.lexer import default
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import JSON
from werkzeug.security import generate_password_hash, check_password_hash
from pytz import timezone
from passlib.context import CryptContext
from sqlalchemy.ext.hybrid import hybrid_property
from api.v1 import pwd_context






# Initialize SQLAlchemy
db = SQLAlchemy()

def init_db(app):
    """
    Initialize the database with the given Flask app.

    Args:
        app: The Flask application instance.
    """
    db.init_app(app)  # Bind the database instance to the app
    with app.app_context():
        db.create_all()  # Create all database tables defined by models

class User(db.Model):
    """Model representing a user."""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)  # Unique identifier for the user
    name = db.Column(db.String(250), nullable=True)
    username = db.Column(db.String(100), nullable=False, unique=True)  # Unique username
    email = db.Column(db.String(120), nullable=False, unique=True)  # Unique email address
    _password = db.Column("password", db.String(255), nullable=False)  # Store the hashed password
    is_instructor = db.Column(db.Boolean, default=False)  # Flag to indicate if the user is an instructor
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(tz=timezone('UTC')))  # Creation timestamp
    updated_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(tz=timezone('UTC')))  # Update timestamp
    courses = db.Column(db.String(500), nullable=True)
    role = db.Column(db.String(500), nullable=True, default="subscriber")
    img_url = db.Column(db.String(500), nullable=True)
    @hybrid_property
    def password(self):
        return self._password

    @password.setter
    def password(self, value):
        self._password = pwd_context.hash(value)


    def __repr__(self):
        return f"<User(id='{self.id}', username='{self.username}, role = {self.role})>')>"





class Course(db.Model):
    """Model representing a course."""
    __tablename__ = 'courses'

    id = db.Column(db.Integer, primary_key=True)  # Unique identifier for the course
    name = db.Column(db.String(100), nullable=False)  # Name of the course
    img_url = db.Column(db.String(250), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(tz=timezone('UTC')))  # Creation timestamp
    updated_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(tz=timezone('UTC')))  # Update timestamp
    description = db.Column(db.String(550), nullable=False)
    objectifs = db.Column(db.String(550), nullable=False)
    courseType = db.Column(db.String(100), nullable=False)
    target = db.Column(db.String(550), nullable=False)
    registering = db.Column(db.String(550), nullable=True)
    contact = db.Column(db.String(550), nullable=True)
    instructor = db.Column(db.String(250), default="Medikus, I.")
    instructor_img_url = db.Column(db.String(250), nullable=True)
    progression = db.Column(db.String(100), nullable=True)
    modules = db.relationship('CourseModule', backref='course', lazy=True)  # Relationship with CourseModule

    def __repr__(self):
        return f"<Course(id='{self.id}', name='{self.name}')>"

class CourseModule(db.Model):
    """Model representing a module within a course."""
    __tablename__ = 'course_modules'

    id = db.Column(db.Integer, primary_key=True)  # Unique identifier for the module
    title = db.Column(db.String(100), nullable=False)  # Title of the module
    link = db.Column(db.String(100), nullable=False)  # Link associated with the module
    content_type = db.Column(db.String(250), nullable=False)  # Type of content (e.g., Video, Text, Quiz)
    content = db.Column(JSON, nullable=False)  # Store content as JSON
    course_id = db.Column(db.Integer, ForeignKey('courses.id'), nullable=False)  # Foreign key to the course

class Video(db.Model):
    """Model representing a video associated with a course."""
    __tablename__ = 'videos'

    id = db.Column(db.Integer, primary_key=True)  # Unique identifier for the video
    title = db.Column(db.String(100), nullable=False)  # Title of the video
    description = db.Column(db.String(555), nullable=False)  # Description of the video
    video_link = db.Column(db.String(255), nullable=False)  # Link to the video
    video_id = db.Column(db.Integer)  # Identifier for the video

class QuizQuestion(db.Model):
    """Model representing a question within a quiz."""
    __tablename__ = 'quiz_questions'

    id = db.Column(db.Integer, primary_key=True)  # Unique identifier for the question
    question = db.Column(db.String(255), nullable=False)  # The quiz question text
    answers = db.Column(JSON, nullable=False)  # Store possible answers as JSON
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz_contents.id'), nullable=False)  # Foreign key to the quiz

class QuizContent(db.Model):
    """Model representing a quiz."""
    __tablename__ = 'quiz_contents'

    id = db.Column(db.Integer, primary_key=True)  # Unique identifier for the quiz
    title = db.Column(db.String(100), nullable=False)  # Title of the quiz
    questions = db.relationship('QuizQuestion', backref='quiz', lazy=True)  # Relationship with QuizQuestion

class TextContent(db.Model):
    """Model representing text content associated with a course."""
    __tablename__ = 'text_contents'

    id = db.Column(db.Integer, primary_key=True)  # Unique identifier for the text content
    title = db.Column(db.String(100), nullable=False)  # Title of the text content
    text = db.Column(JSON, nullable=False)  # Store text as JSON
    important_text = db.Column(JSON)  # Store important text as JSON
    list_items = db.Column(JSON)  # Store list items as JSON

# Additional models can be added following the same structure



class TokenBLockList(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    jti = db.Column(db.String(36), nullable=False, unique=True)
    token_type = db.Column(db.String(10), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    revoked_at = db.Column(db.DateTime)
    expires =  db.Column(db.DateTime, nullable=False)

    user = db.relationship("User")

