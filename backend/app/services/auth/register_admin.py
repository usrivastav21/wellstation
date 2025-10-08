from flask import jsonify
from app.db.collections import COLLECTIONS
from werkzeug.security import generate_password_hash

from app.db.operations import find_data, insert_data


def register_admin(payload: dict):

    required_fields = ["venue", "launch", "user_name", "password"]
    for field in required_fields:
        if field not in payload:
            return jsonify({"error": f"Missing field `{field}`"}), 400

    # Check if admin already exists
    existing_admin = find_data(
        COLLECTIONS["ADMIN_AUTH"], {"user_name": payload["user_name"]}, limit=1
    )
    if existing_admin:
        return jsonify({"error": "Admin already exists."}), 409

    hashed_password = generate_password_hash(
        payload["password"], method="pbkdf2:sha256"
    )

    admin_doc = {
        "venue": payload["venue"],
        "launch": payload["launch"],
        "user_name": payload["user_name"],
        "password": hashed_password,
    }
    try:
        insert_data(COLLECTIONS["ADMIN_AUTH"], admin_doc)
    except Exception as e:
        return jsonify({"error": "Failed to register admin", "message": str(e)}), 500

    return jsonify({"message": "Admin registered successfully."}), 201
