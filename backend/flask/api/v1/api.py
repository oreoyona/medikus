from flask import Blueprint, jsonify
from models import User

api_v1 = Blueprint('api_v1', __name__, url_prefix='/api/v1')

@api_v1.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{'id': user.id, 'username': user.username, 'email': user.email} for user in users])