from flask import Blueprint, jsonify, request
from models import Course, User, db
import logging

# Create a blueprint for version 1 of the API with a URL prefix of '/api/v1'
api_v1 = Blueprint('api_v1', __name__, url_prefix='/api/v1')

# Configure logging to display informational messages and above
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Route to retrieve all users from the database
@api_v1.route('/users', methods=['GET'])
def get_users():
    """
    Handle GET requests to fetch all users.

    Returns:
        JSON response containing a list of users with their id, username, and email.
    """
    # Query all users from the User model
    users = User.query.all()
    # Return a JSON response with user details
    return jsonify([{'id': user.id, 'username': user.username, 'email': user.email} for user in users])

# Route to search for courses based on a search term
@api_v1.route('/courses/search', methods=['POST'])
def search_for_courses():
    """
    Handle POST requests to search for courses based on user-provided search term.

    Returns:
        JSON response indicating success with the matching courses or an error message.
    """
    try:
        # Get JSON data from the request
        data = request.get_json()
        
        # Validate the data
        if not data or 'term' not in data or not isinstance(data['term'], str):
            return jsonify({"message": "erreur", "erreur": "Term is required and must be a string."}), 400
        
        # Search for courses that match the search term (case-insensitive)
        search_term = data['term'].lower()
        courses = Course.query.filter(Course.name.ilike(f'%{search_term}%')).all()
        
        # Prepare the response data
        course_data = [{'id': course.id, 'name': course.name, 'imgUrl': course.imgUrl, } for course in courses]

        return jsonify({"message": "ok", "data": course_data})
    
    except Exception as e:
        # Log any exceptions that occur during JSON processing
        logging.error(f"Error processing JSON data: {e}")  # Log error securely
        # Return a generic error response
        return jsonify({"message": "erreur", "erreur": "An error occurred."}), 400
    



#route to create a new course
@api_v1.route("/courses/add", methods=['POST'])
def create_course():
    """
    Handle POST requests to add a new course into the database

    Returns:
        JSON response indicating success or an error message.
    """


#   start by checking if the user logged in has the authorization to post to this route





#   check if the form which comes an JSON is indeed valid
    pass