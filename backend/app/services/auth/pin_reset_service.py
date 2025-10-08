import string
import secrets
from time import timezone
from flask import request, current_app
from datetime import datetime, timedelta, timezone
from werkzeug.security import generate_password_hash, check_password_hash
import jwt

from app.db.operations import find_data, insert_data, update_data
from app.db.collections import COLLECTIONS
from app.validations.regex_patterns import EMAIL_REGEX, PIN_REGEX
from app.services.email.email_service import EmailService


class PinResetService:

    def generate_secure_pin(self, length=6):
        """Generate a secure random PIN"""
        characters = string.ascii_letters + string.digits
        return "".join(secrets.choice(characters) for _ in range(length))

    def reset_pin(self, email):
        """Request a PIN reset for the given email"""
        if not EMAIL_REGEX.fullmatch(email.strip().lower()):
            return {"success": False, "error": "Invalid email format"}

        user_result = find_data(
            COLLECTIONS["USER_AUTH"], {"email": email.strip().lower()}, limit=1
        )
        if not user_result:
            return {
                "success": True,
                "message": "If email exists, reset instructions have been sent",
            }

        user = user_result[0]

        recent_requests = find_data(
            COLLECTIONS["PIN_ACTIVITIES"],
            {
                "user_id": user.get("user_id", ""),
                "activity_type": "reset_request",
                "timestamp": {"$gt": datetime.now(timezone.utc) - timedelta(hours=1)},
            },
        )

        if len(recent_requests) >= 5:
            return {
                "success": False,
                "error": "Too many reset requests. Please try again later.",
            }

        temp_pin = self.generate_secure_pin()
        temp_pin_hash = generate_password_hash(temp_pin, method="pbkdf2:sha256")
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)

        pin_activity = {
            "user_id": user.get("user_id", ""),
            "activity_type": "reset_request",
            "email": email.strip().lower(),
            "temp_pin_hash": temp_pin_hash,
            "temp_pin_expires_at": expires_at,
            "timestamp": datetime.now(timezone.utc),
            "ip_address": request.remote_addr,
            "user_agent": request.headers.get("User-Agent", ""),
            "status": "pending",
            "attempts": 0,
            "notes": "PIN reset requested",
        }

        insert_data(COLLECTIONS["PIN_ACTIVITIES"], pin_activity)

        try:
            email_service = EmailService()
            email_service.send_pin_reset(
                to_email=email,
                temp_pin=temp_pin,
            )
        except Exception as e:
            current_app.logger.error(f"Failed to send PIN reset email: {e}")
            return {
                "success": False,
                "error": "Failed to send reset email. Please try again.",
            }

        return {
            "success": True,
            "message": "If email exists, reset instructions have been sent",
        }

    def validate_temp_pin(self, email, temp_pin):
        """Validate temporary PIN from reset request"""
        user_result = find_data(
            COLLECTIONS["USER_AUTH"], {"email": email.strip().lower()}, limit=1
        )
        if not user_result:
            return {"success": False, "error": "Invalid email or PIN"}

        user = user_result[0]

        active_request = find_data(
            COLLECTIONS["PIN_ACTIVITIES"],
            {
                "user_id": user.get("user_id", ""),
                "activity_type": "reset_request",
                "status": "pending",
                "temp_pin_expires_at": {"$gt": datetime.now(timezone.utc)},
            },
            limit=1,
        )

        if not active_request:
            return {"success": False, "error": "No active PIN reset request"}

        request_data = active_request[0]

        if request_data["attempts"] >= 3:
            update_data(
                COLLECTIONS["PIN_ACTIVITIES"],
                {"_id": request_data["_id"]},
                {"$set": {"status": "expired", "notes": "Max attempts exceeded"}},
            )
            return {"success": False, "error": "PIN expired due to too many attempts"}

        if not check_password_hash(request_data["temp_pin_hash"], temp_pin):
            update_data(
                COLLECTIONS["PIN_ACTIVITIES"],
                {"_id": request_data["_id"]},
                {"$inc": {"attempts": 1}},
            )
            return {"success": False, "error": "Invalid temporary PIN"}

        update_data(
            COLLECTIONS["PIN_ACTIVITIES"],
            {"_id": request_data["_id"]},
            {"$set": {"status": "used", "used_at": datetime.now(timezone.utc)}},
        )

        payload = {
            "email": user["email"],
            "is_temp_pin": True,
            "user_id": user.get("user_id", ""),
        }
        token = self.generate_temp_pin_token(payload)

        return {
            "success": True,
            "token": token,
            "requires_pin_change": True,
            "message": "Temporary PIN validated successfully",
        }

    def change_pin(self, user_id, new_pin, confirm_pin):
        """Change PIN after successful temporary PIN validation"""
        if not PIN_REGEX.fullmatch(new_pin):
            return {"success": False, "error": "PIN must be exactly 6 digits"}

        if new_pin != confirm_pin:
            return {"success": False, "error": "PINs do not match"}

        user_result = find_data(COLLECTIONS["USER_AUTH"], {"user_id": user_id}, limit=1)

        if not user_result:
            return {"success": False, "error": "User not found"}

        user = user_result[0]

        new_pin_hash = generate_password_hash(new_pin, method="pbkdf2:sha256")

        update_data(
            COLLECTIONS["USER_AUTH"],
            {"user_id": user_id},
            {
                "$set": {
                    "pin_hash": new_pin_hash,
                    "pin_changed_at": datetime.now(timezone.utc),
                }
            },
        )

        pin_change_activity = {
            "user_id": user_id,
            "activity_type": "pin_change",
            "timestamp": datetime.now(timezone.utc),
            "ip_address": request.remote_addr,
            "user_agent": request.headers.get("User-Agent", ""),
            "status": "success",
            "notes": "PIN changed after reset",
        }

        insert_data(COLLECTIONS["PIN_ACTIVITIES"], pin_change_activity)

        payload = {
            "email": user["email"],
            "is_temp_pin": False,
            "user_id": user.get("user_id", ""),
        }
        new_token = self.generate_token(payload)

        return {
            "success": True,
            "token": new_token,
            "message": "PIN changed successfully",
        }

    def generate_temp_pin_token(self, payload):
        """Generate JWT token for temporary PIN users"""
        now = datetime.now(timezone.utc)
        payload.update(
            {
                "exp": now + timedelta(minutes=30),  # Short expiration for temp PIN
                "iat": now,
                "is_temp_pin": True,
            }
        )

        return jwt.encode(
            payload,
            current_app.config["JWT_SECRET_KEY"],
            algorithm=current_app.config["JWT_ALGORITHM"],
        )

    def generate_token(self, payload):
        """Generate regular JWT token"""
        now = datetime.now(timezone.utc)
        payload.update(
            {"exp": now + current_app.config["JWT_EXP_DELTA_USER"], "iat": now}
        )

        return jwt.encode(
            payload,
            current_app.config["JWT_SECRET_KEY"],
            algorithm=current_app.config["JWT_ALGORITHM"],
        )
