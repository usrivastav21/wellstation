from flask import Blueprint, jsonify
from flask_cors import cross_origin

api_bp = Blueprint('api', __name__)

@cross_origin(origin='*')
@api_bp.route('/health', methods=['GET'])
def get_data():
    return jsonify({"message": "Hello from API"})

