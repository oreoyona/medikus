from flask import Blueprint, jsonify, request
from models import Course, CourseModule, User, db
import logging

# Create a blueprint for version 1 of the API with a URL prefix of '/api/v1'
api_v1 = Blueprint('api_v1', __name__, url_prefix='/api/v1')

# Configure logging to display informational messages and above
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')



@api_v1.route("/courses/", methods=['GET'])
def get_all_courses():
    """
    Handle GET requests to retreive all the courses resgistered in the database

    Returns:
        JSON response indicating success with the matching courses or an error message.
    
    """
    courses = db.session.execute(db.select(Course).order_by(Course.id)).scalars()
    data = []
    for el in courses:
        obj = {
            'name': el.name,
            'id': el.id,
            'imgUrl': el.img_url,
            'description': el.description,
            'target': el.target,
            'objectifs': el.objectifs,
            'date': el.created_at,
            'courseType': el.courseType,
            'registering': el.registering,
            'contact': el.contact,
            'instructor': el.instructor,
            'instructorImgUrl': el.instructor_img_url,
            'modules': [{'title': part.title, 'link': part.link, 'content': part.content, 'contentType': part.content_type, 'parts': part.content} for part in el.modules]
        }
        data.append(obj)

    return jsonify({'message': 201, 'data': data}), 201


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
    
#h route to retreive a single course by its id

@api_v1.route('/courses/<int:course_id>', methods=['GET', 'PUT'])
def get_course(course_id):
    """
    Handles GET requests for a specific course 

    Returns:
    A JSON response of the success or not of the operation 
    """ 
    course = db.get_or_404(Course, course_id)
    
    if request.method == 'GET':

        try:
            data = {
                'id': course.id,
                'name': course.name,
                'description': course.description,
                'imgUrl': course.img_url,
                'date': course.created_at,
                'target': course.target,
                'objectifs': course.objectifs,
                'courseType': course.courseType,
                'registering': course.registering,
                'contact': course.contact,
                'instructor': course.instructor,
                'instructorImgUrl': course.instructor_img_url,
                'modules': [{
                    'title': module.title,
                    'link': module.link,
                    'contentType': module.content_type,
                    'content': module.content,
                    'parts': module.content 
                }   for module in course.modules]
            }

            return jsonify({'message': 200, 'data': data}), 200
        except Exception as e:
            logging.error(e)
            return jsonify({'message': 404, 'data': None}), 404
    elif request.method == "PUT":
        # Update existing course
        if not course:
            return jsonify({"message": 404}), 404

        # Update course fields
        data = request.get_json()
        old_modules = db.session.execute(db.select(CourseModule).filter_by(course_id=course.id)).scalars()
        
        course.name = data.get('name', course.name)
        course.img_url = data.get('imgUrl', course.img_url)
        course.description = data.get('description', course.description)
        course.objectifs = data.get('objectifs', course.objectifs)
        course.courseType = data.get('courseType', course.courseType)
        course.target = data.get('target', course.target)
        course.contact = data.get('contact', course.contact)
        course.registering = data.get('registering', course.registering)
        course.instructor = data.get('instructor', course.instructor)
        course.instructor_img_url = data.get('instructorImgUrl', course.instructor_img_url)
        # Clear existing modules and set the new ones
       
        for old_module in old_modules:
            db.session.delete(old_module)
       
        for module_data in data.get('modules'):
           
            module = CourseModule(
                title=module_data['title'],
                link=module_data['link'],
                course=course,
                content_type="Type de Contenu"
            )
            parts = module_data['parts']
        
            for key in parts:
                # Handle content based on content type
                if key['contentType'] == 'Questions':
                    module.content = {
                        "contentType": "Questions",
                        "question": key.get('question'),
                        "response": key.get('response')
                    }
                elif key['contentType'] == 'Text':
                    module.content = {
                        "contentType": "Text",
                        "title": key.get('title'),
                        "content": key.get('content')
                    }
                elif key['contentType'] == 'Video':
                    module.content = {
                        "contentType": "Video",
                        "title": key.get('title'),
                        "description": key.get('description'),
                        "videoUrl": key.get('videoUrl')
                    }
                else:
                    return jsonify({"error": f"Invalid content type: {key['contentType']}"}), 400
            course.modules.append(module)  # Append module to the course's modules
        
        try:
            db.session.commit()
            return jsonify({"message": "200"}), 200
        except Exception as e:
            db.session.rollback()  # Rollback in case of error
            print(e)
            return jsonify({"message": 500}), 500
        
        finally:
            db.session.close()

    
    return jsonify({'message': 404})



        
    
#handle adding a new course
@api_v1.route("/courses/add", methods=['POST'])
def create_course():
    """
    Handle POST requests to add a new course into the database.

    Returns:
        JSON response indicating success or an error message.
    """
    data = request.get_json()

    # Check if the user is authorized (this will depend on your authentication setup)
    # if not user_is_authorized():
    #     return jsonify({"error": "Unauthorized"}), 403

    # Validate incoming data
    if not data:
        return jsonify({"error": "No data provided"}), 400

    required_fields = ['name', 'imgUrl', 'description', 'objectifs', 'courseType', 'target', 'modules']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    # Create a new Course instance
    course = Course(
        name=data['name'],
        img_url=data['imgUrl'],  # Ensure the key matches your model
        description=data['description'],
        objectifs=data['objectifs'],
        courseType=data['courseType'],
        target=data['target'],
        registering=data['registering'],
        contact=data['contact'],
        instructor=data['instructor'],
        instructor_img_url= data['course.instructorImgUrl'],
    )

    # Loop through modules and create CourseModule instances
    for module in data['modules']:
        parts = module['parts']
        for  key in parts: 
            new_module = CourseModule(
                title=module['title'],
                link=module['link'],
                content_type=key['contentType'],  # Ensure this matches your model
                course=course  # Set the backref to the course
            )
        
        # Handle content based on content type
            if key['contentType'] == 'Questions':
                new_module.content = {
                "contentType": "Questions",
                "question": key.get('question'),
                "response": key.get('response')
                }
            elif key['contentType'] == 'Text':
                new_module.content = {
                "contentType": "Text",
                "title": key.get('title'),
                "content": key.get('content')
                }
            elif key['contentType'] == 'Video':
                new_module.content = {
                "contentType": "Video",
                "title": key.get('title'),
                "description": key.get('description'),
                "videoUrl": key.get('videoUrl')
                }
            else:
                return jsonify({"error": f"Invalid content type: {module['contentType']}"}), 400

        course.modules.append(new_module)  # Append module to the course's modules
        
        try:
            db.session.add(course)
            db.session.commit()
            return jsonify({"message": "201", "course_id": course.id}), 201
        except Exception as e:
            db.session.rollback()  # Rollback in case of error

            return jsonify({"error": str(e)}), 500
    
        finally:
            db.session.close()

@api_v1.route("/courses/<int:course_id>/", methods=['DELETE'])
def delete_course(course_id):
    """
    Handles DELETE requests for a specific course 

    Returns:
    A JSON response of the success or not of the operation 
    """
    course = db.session.execute(db.select(Course).filter_by(id=int(course_id))).scalar_one()
    

    try:
        for module in course.modules:
            db.session.delete(module)
        db.session.delete(course)
        db.session.commit()
        return jsonify({"message": 200}), 200
    except Exception as e:
        db.session.rollback() 
        logging.info(e)
        return jsonify({'message': ''}), 404

    finally:
        db.session.close()
