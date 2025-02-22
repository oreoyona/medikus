import datetime
from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import JSON
from werkzeug.security import generate_password_hash, check_password_hash
from pytz import timezone

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

class Course(db.Model):
    """Model representing a course."""
    __tablename__ = 'courses'

    id = db.Column(db.Integer, primary_key=True)  # Unique identifier for the course
    name = db.Column(db.String(100), nullable=False)  # Name of the course
    imgUrl = db.Column(db.String(250), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(tz=timezone('UTC')))  # Creation timestamp
    updated_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(tz=timezone('UTC')))  # Update timestamp
    description = db.Column(db.String(250), nullable=False)
    objectifs = db.Column(db.String(250), nullable=False)
    courseType = db.Column(db.String(100), nullable=False)
    target = db.Column(db.String(250), nullable=False)
    modules = db.relationship('CourseModule', backref='course', lazy=True)  # Relationship with CourseModule

    def __repr__(self):
        return f"<Course(id='{self.id}', name='{self.name}')>"

class User(db.Model, UserMixin):
    """Model representing a user."""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)  # Unique identifier for the user
    username = db.Column(db.String(100), nullable=False, unique=True)  # Unique username
    email = db.Column(db.String(120), nullable=False, unique=True)  # Unique email address
    password_hash = db.Column(db.String(128), nullable=False)  # Store the hashed password
    is_instructor = db.Column(db.Boolean, default=False)  # Flag to indicate if the user is an instructor
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(tz=timezone('UTC')))  # Creation timestamp
    updated_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(tz=timezone('UTC')))  # Update timestamp

    def __repr__(self):
        return f"<User(id='{self.id}', username='{self.username}')>"
    
    def set_password(self, password):
        """Hash the password before storing it."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Check the provided password against the stored hash."""
        return check_password_hash(self.password_hash, password)

class CourseModule(db.Model):
    """Model representing a module within a course."""
    __tablename__ = 'course_modules'

    id = db.Column(db.Integer, primary_key=True)  # Unique identifier for the module
    title = db.Column(db.String(100), nullable=False)  # Title of the module
    link = db.Column(db.String(100), nullable=False)  # Link associated with the module
    content_type = db.Column(db.Integer, nullable=False)  # Type of content (e.g., Video, Text, Quiz)
    content = db.Column(JSON, nullable=False)  # Store content as JSON
    course_id = db.Column(db.Integer, ForeignKey('courses.id'), nullable=False)  # Foreign key to the course

class Video(db.Model):
    """Model representing a video associated with a course."""
    __tablename__ = 'videos'

    id = db.Column(db.Integer, primary_key=True)  # Unique identifier for the video
    title = db.Column(db.String(100), nullable=False)  # Title of the video
    description = db.Column(db.String(255), nullable=False)  # Description of the video
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