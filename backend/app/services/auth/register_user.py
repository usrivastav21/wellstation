import re
from datetime import datetime
import uuid

from flask import jsonify
from werkzeug.security import generate_password_hash

from app.db.collections import COLLECTIONS
from app.db.operations import find_data, insert_data
from app.validations.regex_patterns import EMAIL_REGEX, PIN_REGEX
from app.services.auth.login_user_service import login_user
from app.services.trial.trial_service import trial_service

# Allowed values for gender
ALLOWED_GENDERS = {"male", "female"}
BIRTH_MONTH_YEAR_REGEX = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")  # YYYY-MM


def register_user(
    payload: dict,
):

    # 1) Check for required fields
    for field in ["email", "gender", "pin", "confirm_pin", "birth_month_year", "role"]:
        if field not in payload:
            return jsonify({"error": f"Missing field `{field}`"}), 400

    email = payload["email"].strip().lower()
    if not EMAIL_REGEX.fullmatch(email):
        return jsonify({"error": "Invalid email format"}), 400

    existing_user = find_data(COLLECTIONS["USER_AUTH"], {"email": email}, limit=1)
    if existing_user:
        return jsonify({"error": "User already exists."}), 409

    gender = payload["gender"]
    pin = payload["pin"]
    confirm_pin = payload["confirm_pin"]
    birth_month_year = payload["birth_month_year"]
    role = payload["role"].strip().lower()

    # Optional trial_id for linking trial reports
    trial_id = payload.get("trial_id")

    if gender not in ALLOWED_GENDERS:
        return jsonify({"error": "Invalid gender value."}), 400

    if not PIN_REGEX.match(pin):
        return jsonify({"error": "PIN must be exactly 6 alphanumeric characters."}), 400

    if pin != confirm_pin:
        return jsonify({"error": "PIN and confirm_pin do not match."}), 400

    if not BIRTH_MONTH_YEAR_REGEX.fullmatch(birth_month_year):
        return jsonify({"error": "birth_month_year must be in YYYY-MM format."}), 400

    try:
        birth_date = datetime.strptime(birth_month_year, "%Y-%m")
        birth_date = birth_date.replace(day=1)
    except ValueError:
        return jsonify({"error": "birth_date must be in YYYY-MM-DD format."}), 400

    if role not in ["admin", "user"]:
        return jsonify({"error": "Invalid role value."}), 400

    pin_hash = generate_password_hash(pin, method="pbkdf2:sha256")

    user_doc = {
        "gender": gender,
        "pin_hash": pin_hash,
        "birth_date": birth_date,
        "email": email,
        "role": role,
        "user_id": str(uuid.uuid4()),
    }

    try:
        insert_data(COLLECTIONS["USER_AUTH"], user_doc)
    except Exception as e:
        return jsonify({"error": "Failed to register user", "message": str(e)}), 500

    # 7) Link trial report if trial_id provided
    trial_linking_result = None
    if trial_id:
        try:
            # Get the user_id from the inserted document
            user_id = user_doc["user_id"]

            # Link trial to user
            trial_linking_result = trial_service.link_trial_to_user(
                trial_id, user_id, email
            )

        except Exception as e:
            # Log the error but don't fail registration
            print(f"Warning: Failed to link trial {trial_id} to user {email}: {str(e)}")
            trial_linking_result = {"error": str(e)}

    # 8) Login the user
    login_result = login_user({"email": email, "role": role, "pin": pin})

    # 9) Add trial linking info to response if applicable
    if trial_id and trial_linking_result:
        if isinstance(login_result, tuple):
            # Handle tuple response (error case)
            return login_result
        else:
            # Add trial linking info to successful login response
            if hasattr(login_result, "json"):
                response_data = login_result.json
            else:
                response_data = login_result

            if isinstance(response_data, dict):
                response_data["trial_linking"] = trial_linking_result
                return jsonify(response_data), 200

    return login_result
