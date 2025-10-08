from datetime import datetime, timezone, date
from typing import Dict, Optional, Tuple

from flask import current_app, request
import jwt
from werkzeug.security import check_password_hash

from app.db.collections import COLLECTIONS
from app.db.operations import find_data, update_data
from app.validations.regex_patterns import EMAIL_REGEX, PIN_REGEX


class LoginUserService:
    def __init__(self):
        self.config = current_app.config

    def generate_token(self, payload: dict, role: str) -> str:
        """Generate JWT token for user/admin authentication"""
        now = datetime.now(timezone.utc)

        if role == "admin":
            exp = now + self.config["JWT_EXP_DELTA_ADMIN"]
        else:
            exp = now + self.config["JWT_EXP_DELTA_USER"]

        payload.update(
            {
                "role": role,
                "exp": exp,
                "iat": now,
            }
        )

        token = jwt.encode(
            payload,
            self.config["JWT_SECRET_KEY"],
            algorithm=self.config["JWT_ALGORITHM"],
        )
        return token

    def _get_age_range(self, birth_date_input) -> Optional[str]:
        """Calculate age range from birth date"""
        if not birth_date_input:
            return None

        try:
            if isinstance(birth_date_input, datetime):
                birth_date = birth_date_input.date()
            elif isinstance(birth_date_input, date):
                birth_date = birth_date_input
            else:
                birth_date_str = str(birth_date_input)
                try:
                    birth_date = datetime.strptime(birth_date_str, "%Y-%m-%d").date()
                except ValueError:
                    try:
                        birth_date = datetime.strptime(
                            birth_date_str, "%m/%d/%Y"
                        ).date()
                    except ValueError:
                        return None

            today = date.today()
            age = (
                today.year
                - birth_date.year
                - ((today.month, today.day) < (birth_date.month, birth_date.day))
            )

            if age < 18:
                return "<18"
            elif 18 <= age <= 25:
                return "18-25"
            elif 26 <= age <= 35:
                return "26-35"
            elif 36 <= age <= 45:
                return "36-45"
            elif 46 <= age <= 55:
                return "46-55"
            elif 56 <= age <= 65:
                return "56-65"
            else:
                return "65+"

        except Exception:
            return None

    def _validate_user_login_data(self, data: dict) -> Tuple[bool, str, int]:
        """Validate user login input data"""
        for field in ["email", "pin"]:
            if field not in data:
                return False, f"Missing field `{field}`", 400

        email = data["email"].strip().lower()
        if not EMAIL_REGEX.fullmatch(email):
            return False, "Invalid email format.", 400

        pin = data["pin"]
        if not PIN_REGEX.fullmatch(pin):
            return False, "PIN must be exactly 6 alphanumeric characters.", 400

        return True, email, pin

    def _handle_temp_pin_login(self, user: dict, pin: str) -> Tuple[Dict, int]:
        """Handle temporary PIN login for password reset"""
        active_reset = find_data(
            COLLECTIONS["PIN_ACTIVITIES"],
            {
                "user_id": user.get("user_id", ""),
                "activity_type": "reset_request",
                "status": "pending",
                "temp_pin_expires_at": {"$gt": datetime.now(timezone.utc)},
            },
            limit=1,
        )

        if not active_reset:
            return {"error": "No active PIN reset found"}, 401

        reset_data = active_reset[0]

        if reset_data["attempts"] >= 3:
            update_data(
                COLLECTIONS["PIN_ACTIVITIES"],
                {"_id": reset_data["_id"]},
                {"$set": {"status": "expired", "notes": "Max attempts exceeded"}},
            )
            return {"error": "PIN expired due to too many attempts"}, 401

        if check_password_hash(reset_data["temp_pin_hash"], pin):
            update_data(
                COLLECTIONS["PIN_ACTIVITIES"],
                {"_id": reset_data["_id"]},
                {"$set": {"status": "used", "used_at": datetime.now(timezone.utc)}},
            )

            payload = {
                "email": user["email"],
                "is_temp_pin": True,
                "user_id": user.get("user_id", ""),
            }
            token = self.generate_token(payload, "user")

            return {
                "message": "Login successful, please change your PIN",
                "token": token,
                "requires_pin_change": True,
                "user": {
                    "email": user["email"],
                    "role": "user",
                    "age": self._get_age_range(user.get("birth_date")),
                    "gender": user.get("gender", ""),
                },
            }, 200
        else:
            update_data(
                COLLECTIONS["PIN_ACTIVITIES"],
                {"_id": reset_data["_id"]},
                {"$inc": {"attempts": 1}},
            )
            return {"error": "Invalid temporary PIN"}, 401

    def _authenticate_user(self, email: str, pin: str) -> Tuple[Dict, int]:
        """Authenticate regular user login"""
        user_result = find_data(COLLECTIONS["USER_AUTH"], {"email": email}, limit=1)

        if not user_result:
            return {"error": "Invalid email or PIN."}, 401

        user = user_result[0]
        stored_pin_hash = user.get("pin_hash")

        if not stored_pin_hash or not check_password_hash(stored_pin_hash, pin):
            return {"error": "Invalid email or PIN."}, 401

        payload = {"email": user["email"]}
        token = self.generate_token(payload, "user")

        return {
            "message": "Login successful",
            "token": token,
            "user": {
                "email": user["email"],
                "role": "user",
                "age": self._get_age_range(user.get("birth_date")),
                "gender": user.get("gender", ""),
            },
        }, 200

    def _validate_admin_login_data(self, data: dict) -> Tuple[bool, str, str, int]:
        """Validate admin login input data"""
        for field in ["user_name", "password"]:
            if field not in data:
                return False, "", "", 400

        user_name = data.get("user_name", "").strip()
        password = data.get("password", "")

        if not user_name or not password:
            return False, "", "", 400

        return True, user_name, password, 200

    def _authenticate_admin(self, user_name: str, password: str) -> Tuple[Dict, int]:
        """Authenticate admin login"""
        admin = find_data(COLLECTIONS["ADMIN_AUTH"], {"user_name": user_name}, limit=1)

        if not admin:
            return {"error": "Invalid admin credentials."}, 401

        admin_result = admin[0]
        if not check_password_hash(admin_result["password"], password):
            return {"error": "Invalid admin credentials."}, 401

        payload = {"user_name": admin_result["user_name"]}
        token = self.generate_token(payload, "admin")

        return {
            "message": "Login successful",
            "token": token,
            "user": {
                "user_name": admin_result["user_name"],
                "role": "admin",
                "launch": admin_result.get("launch", ""),
            },
        }, 200

    def _check_existing_session(self) -> bool:
        """Check if user already has an active session"""
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                payload = jwt.decode(
                    token,
                    self.config["JWT_SECRET_KEY"],
                    algorithms=[self.config["JWT_ALGORITHM"]],
                )
                print("payload", payload)
                # Currently allowing login even if already logged in
                # Uncomment below to prevent multiple logins
                # if payload.get("role") == "user":
                #     return True
            except jwt.ExpiredSignatureError:
                pass  # Allow login if previous token expired
            except jwt.InvalidTokenError:
                pass  # Allow login if previous token invalid
        return False

    def login(self, data: dict) -> Tuple[Dict, int]:
        """Main login method that orchestrates the authentication process"""
        print("request auth header", request.headers.get("Authorization"))

        # Check existing session (currently disabled)
        # if self._check_existing_session():
        #     return {"error": "Already logged in"}, 403

        role = data.get("role")

        if role == "user":
            # Validate input data
            is_valid, email, pin = self._validate_user_login_data(data)
            if not is_valid:
                return {"error": "Invalid email or PIN."}, 401

            user_result = find_data(COLLECTIONS["USER_AUTH"], {"email": email}, limit=1)
            if user_result:
                user = user_result[0]
                active_reset = find_data(
                    COLLECTIONS["PIN_ACTIVITIES"],
                    {
                        "user_id": user.get("user_id", ""),
                        "activity_type": "reset_request",
                        "status": "pending",
                        "temp_pin_expires_at": {"$gt": datetime.now(timezone.utc)},
                    },
                    limit=1,
                )

                if active_reset:
                    return self._handle_temp_pin_login(user, pin)

            return self._authenticate_user(email, pin)

        elif role == "admin":
            is_valid, user_name, password, status_code = (
                self._validate_admin_login_data(data)
            )
            if not is_valid:
                return {"error": "user_name and password are required."}, 400

            return self._authenticate_admin(user_name, password)

        else:
            return {"error": "Invalid role."}, 400


# Backward compatibility - keep the original function
def login_user(data: dict):
    """Legacy function for backward compatibility"""
    service = LoginUserService()
    return service.login(data)
