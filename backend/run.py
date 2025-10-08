import os
import time
import signal
import atexit
import threading
from typing import Union
import sys
import jwt
import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path
from flask import current_app
from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from werkzeug.serving import make_server

from app.db.collections import COLLECTIONS
from app.db.operations import update_data, find_data, insert_data
from app.routes.media import process_video, process_audio, fetch_user_report_by_id
from app.services.auth.register_admin import register_admin
from app.services.auth.login_user_service import login_user
from app.services.auth.register_user import register_user
from app.services.booth.booth import (
    fetch_booth_locations,
    add_booth_location,
    update_booth_location,
)
from config import config_by_name

from app.services.email.email_service import send_email

from app.services.report.date_reports_service import fetch_report_by_date
from app.services.report.month_reports_with_intervals_service import (
    fetch_monthly_report_by_date,
)
from app.services.report.year_reports_service import fetch_yearly_report_by_date
from app.services.report.week_reports_service import fetch_weekly_report_by_date
from app.services.report.month_reports_service import fetch_month_reports
from app.services.report.reward_points_service import fetch_reward_points

from app.validations.login_required import login_required

from app.services.auth.pin_reset_service import PinResetService
from app.services.trial.trial_service import trial_service
from app.services.media.media import audioProcessingStart, videoProcessingStart

from app.routes import init_app


# Setup logging configuration
def setup_logging():
    """Configure logging for the application"""
    # Create logs directory if it doesn't exist
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)

    # Configure root logger
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    # Clear any existing handlers
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)

    # Create formatters
    detailed_formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s"
    )
    simple_formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")

    # Console handler (INFO level and above)
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(simple_formatter)
    logger.addHandler(console_handler)

    # File handler for all logs (DEBUG level and above)
    all_logs_handler = RotatingFileHandler(
        logs_dir / "wellstation.log", maxBytes=10 * 1024 * 1024, backupCount=5  # 10MB
    )
    all_logs_handler.setLevel(logging.DEBUG)
    all_logs_handler.setFormatter(detailed_formatter)
    logger.addHandler(all_logs_handler)

    # File handler for errors only (ERROR level and above)
    error_logs_handler = RotatingFileHandler(
        logs_dir / "wellstation_errors.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
    )
    error_logs_handler.setLevel(logging.ERROR)
    error_logs_handler.setFormatter(detailed_formatter)
    logger.addHandler(error_logs_handler)

    logging.info("Logging system initialized")
    logging.info(f"Log files will be saved to: {logs_dir.absolute()}")


setup_logging()

app = Flask(__name__)
CORS(app)

env = os.getenv("FLASK_ENV", "development")

# Detect if running from PyInstaller bundle for logging
is_pyinstaller_bundle = getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS")

if is_pyinstaller_bundle:
    logging.info(f"Running from PyInstaller bundle - {env} environment")
else:
    logging.info(f"Running in development mode - FLASK_ENV: {env}")

app.config.from_object(config_by_name.get(env, config_by_name["default"]))


init_app(app)

# shutdown_event = threading.Event()


# def signal_handler(signum, frame):
#     """Handle shutdown signals gracefully"""
#     print(f"Received signal {signum}, shutting down gracefully...")
#     shutdown_event.set()

#     # Give the server time to shutdown gracefully
#     time.sleep(2)

#     # Force exit if needed
#     print("Forcing exit...")
#     sys.exit(0)


# def cleanup_temp_files():
#     """Clean up PyInstaller temp files on exit"""
#     if hasattr(sys, "_MEIPASS"):
#         print(f"PyInstaller temp directory: {sys._MEIPASS}")
#         print("Temp files will be cleaned up by PyInstaller on normal exit")


# # Register signal handlers
# signal.signal(signal.SIGINT, signal_handler)
# signal.signal(signal.SIGTERM, signal_handler)

# # Register cleanup function
# atexit.register(cleanup_temp_files)


@app.route("/api/health")
def health():
    return jsonify({"status": "healthy"}), 200


@app.route("/api/environment", methods=["GET"])
def get_environment():
    """Return current environment configuration and variables."""
    try:
        # Get basic environment info
        env_info = {
            "flask_env": env,
            "is_pyinstaller_bundle": is_pyinstaller_bundle,
            "config_class": app.config.__class__.__name__,
        }

        # Get all Flask configuration variables
        config_vars = {}
        for key, value in app.config.items():
            # Convert non-serializable values to strings
            try:
                # Test if value is JSON serializable
                import json

                json.dumps(value)
                config_vars[key] = value
            except (TypeError, ValueError):
                config_vars[key] = str(value)

        # Get relevant environment variables
        env_vars = {
            "FLASK_ENV": os.getenv("FLASK_ENV"),
            "PORT": os.getenv("PORT"),
            "ELECTRON_SHUTDOWN": os.getenv("ELECTRON_SHUTDOWN"),
            "MONGO_URI": os.getenv("MONGO_URI"),
            "DATABASE_NAME": os.getenv("DATABASE_NAME"),
            "JWT_SECRET_KEY": os.getenv("JWT_SECRET_KEY"),
            "JWT_ALGORITHM": os.getenv("JWT_ALGORITHM"),
        }

        return jsonify(
            {
                "status": "success",
                "data": {
                    "environment_info": env_info,
                    "flask_config": config_vars,
                    "environment_variables": env_vars,
                },
            }
        )
    except Exception as e:
        return (
            jsonify(
                {
                    "status": "error",
                    "message": f"Failed to get environment info: {str(e)}",
                }
            ),
            500,
        )


@app.route("/api/video", methods=["POST"])
@login_required(allowed_roles=["user", "admin"])
def initVideoProcessing() -> Union[Response, tuple]:
    try:
        result = process_video()

        # Handle tuple response (error with status code)
        if isinstance(result, tuple):
            response_data, status_code = result
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": response_data.get("error", "Unknown error"),
                    }
                ),
                status_code,
            )

        # Handle dict response
        if isinstance(result, dict):
            if result.get("success", False):
                return jsonify(
                    {
                        "status": "success",
                        "message": "Video processed successfully",
                        "data": result.get("data"),
                    }
                )
            else:
                return (
                    jsonify(
                        {
                            "status": "error",
                            "message": result.get("error", "Unknown error"),
                        }
                    ),
                    500,
                )

        # Fallback for unexpected response format
        return (
            jsonify({"status": "error", "message": "Unexpected response format"}),
            500,
        )

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/audio", methods=["POST"])
@login_required(allowed_roles=["user", "admin"])
def initAudioProcessing():
    try:
        result = process_audio()

        # Handle tuple response (error with status code)
        if isinstance(result, tuple):
            response_data, status_code = result
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": response_data.get("error", "Unknown error"),
                    }
                ),
                status_code,
            )

        # Handle dict response
        if isinstance(result, dict):
            if result.get("success", False):
                return jsonify(
                    {
                        "status": "success",
                        "message": "Audio processed successfully",
                        "data": result.get("data"),
                    }
                )
            else:
                return (
                    jsonify(
                        {
                            "status": "error",
                            "message": result.get("error", "Unknown error"),
                        }
                    ),
                    500,
                )

        # Fallback for unexpected response format
        return (
            jsonify({"status": "error", "message": "Unexpected response format"}),
            500,
        )

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/auth/reset-pin", methods=["POST"])
def reset_pin():
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"status": "error", "message": "Email is required"}), 400

    pin_service = PinResetService()
    result = pin_service.reset_pin(email)

    if result.get("success", False):
        return jsonify(result), 200
    else:
        return jsonify(result), 500


@app.route("/api/auth/change-pin", methods=["POST"])
def change_pin():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Authorization token required"}), 401

    token = auth_header.split(" ")[1]

    try:
        payload = jwt.decode(
            token,
            current_app.config["JWT_SECRET_KEY"],
            algorithms=[current_app.config["JWT_ALGORITHM"]],
        )

        if not payload.get("is_temp_pin"):
            return jsonify({"error": "Invalid token for PIN change"}), 401

        data = request.get_json()
        new_pin = data.get("new_pin")
        confirm_pin = data.get("confirm_pin")

        if not new_pin or not confirm_pin:
            return jsonify({"error": "New PIN and confirmation required"}), 400

        pin_service = PinResetService()
        result = pin_service.change_pin(payload["user_id"], new_pin, confirm_pin)

        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 400

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401


@app.route("/api/reports/date", methods=["POST"])
@login_required(allowed_roles=["user", "admin"])
def fetch_report():
    """
    Fetch reports for a specific date.

    Expected request body:
    {
        "email": "user@example.com",
        "date": "2025-08-04"  # ISO 8601 format: YYYY-MM-DD
    }

    Alternative formats supported:
    - "2025-08-04T00:00:00.000Z"  # With time
    - "2025-08-04T00:00:00.000+00:00"  # With time and timezone

    Response format:
    {
        "status": "success",
        "message": "Report fetched successfully",
        "data": {
            "2025-08-04": [reports for this specific date]  # ISO 8601 date format
        }
    }
    """
    data = request.get_json()
    email = data.get("email")
    date = data.get("date")

    if not email:
        return jsonify({"status": "error", "message": "Email is required"}), 400

    if not date:
        return jsonify({"status": "error", "message": "Date is required"}), 400

    try:
        report = fetch_report_by_date(email, date)

        return jsonify(
            {
                "status": "success",
                "message": "Report fetched successfully",
                "data": report,
            }
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/reports/weekly", methods=["GET"])
@login_required(allowed_roles=["user", "admin"])
def fetch_weekly_report():
    """
    Fetch weekly reports for a given date range.

    Expected request body:
    email = request.args.get("email")
    date_range = request.args.get("date_range")

    Alternative formats supported:
    - "2025-08-04T00:00:00.000Z/2025-08-10T23:59:59.999Z"  # With time
    - "2025-08-04 - 2025-08-10"  # Legacy format (deprecated)

    Response format:
    {
        "status": "success",
        "message": "Weekly report fetched successfully",
        "data": {
            "2025-08-04": [reports for Monday],    # ISO 8601 date format
            "2025-08-05": [reports for Tuesday],
            "2025-08-06": [reports for Wednesday],
            "2025-08-07": [reports for Thursday],
            "2025-08-08": [reports for Friday],
            "2025-08-09": [reports for Saturday],
            "2025-08-10": [reports for Sunday]
        }
    }
    """
    email = request.args.get("email")
    date_range = request.args.get("date_range")

    if not email:
        return jsonify({"status": "error", "message": "Email is required"}), 400

    if not date_range:
        return jsonify({"status": "error", "message": "Date range is required"}), 400

    try:
        report = fetch_weekly_report_by_date(email, date_range)

        return jsonify(
            {
                "status": "success",
                "message": "Weekly report fetched successfully",
                "data": report,
            }
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/reports/month", methods=["GET"])
@login_required(allowed_roles=["user", "admin"])
def fetch_month_report():
    email = request.args.get("email")
    month = request.args.get("month")

    if not email:
        return jsonify({"status": "error", "message": "Email is required"}), 400

    if not month:
        return jsonify({"status": "error", "message": "Month is required"}), 400

    try:
        report = fetch_month_reports(email, month)

        return jsonify(
            {
                "status": "success",
                "message": "Report fetched successfully",
                "data": report,
            }
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/reports/monthly", methods=["GET"])
@login_required(allowed_roles=["user", "admin"])
def fetch_monthly_report():
    email = request.args.get("email")
    date = request.args.get("date")

    if not date:
        return jsonify({"status": "error", "message": "Date is required"}), 400

    if not email:
        return jsonify({"status": "error", "message": "Email is required"}), 400

    try:
        report = fetch_monthly_report_by_date(email, date)

        return jsonify(
            {
                "status": "success",
                "message": "Report fetched successfully",
                "data": report,
            }
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/reports/year", methods=["GET"])
@login_required(allowed_roles=["user", "admin"])
def fetch_yearly_report():
    email = request.args.get("email")
    date = request.args.get("date")

    if not date:
        return jsonify({"status": "error", "message": "Date is required"}), 400

    if not email:
        return jsonify({"status": "error", "message": "Email is required"}), 400

    try:
        report = fetch_yearly_report_by_date(email, date)

        return jsonify(
            {
                "status": "success",
                "message": "Report fetched successfully",
                "data": report,
            }
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/reports/rewards", methods=["GET"])
@login_required(allowed_roles=["user", "admin"])
def fetch_user_reward_points():
    email = request.args.get("email")
    report_id = request.args.get("report_id", None)

    if not email:
        return jsonify({"status": "error", "message": "Email is required"}), 400

    try:
        reward_points = fetch_reward_points(email, report_id)

        return jsonify(
            {
                "status": "success",
                "message": "Reward points fetched successfully",
                "data": reward_points,
            }
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/fetch/report/<user_id>", methods=["GET"])
@login_required(allowed_roles=["user", "admin"])
def fetch_user_report(user_id):
    try:
        if not user_id:
            return (
                jsonify(
                    {"status": "error", "message": "user_id parameter is required"}
                ),
                400,
            )

        report = fetch_user_report_by_id(user_id)

        return jsonify(
            {
                "status": "success",
                "message": "Report fetched successfully",
                "data": report[0],
            }
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/send/email", methods=["POST"])
@login_required(allowed_roles=["user", "admin"])
def send_email_api():
    data = request.get_json()

    # Check required fields
    if not all(key in data for key in ["to_email", "subject", "report_link"]):
        return jsonify({"error": "Missing required fields"}), 400

    # Send email
    success = send_email(data["to_email"], data["subject"], data)

    if success:
        report_id = data["report_id"]
        user_email = data.get("to_email", "")
        user_name = data.get("name", "")
        user_mood = data.get("mood", "")

        # Check if user already exists in the collection
        existing_user = find_data(
            COLLECTIONS["USER_EMAIL_RECORDS"], {"email": user_email}, limit=1
        )

        if existing_user:
            # User exists, update the record
            update_operations = {
                "$set": {"email_sent": True},
                "$addToSet": {"report_id": report_id},  # ensures no duplicates
            }

            # Add name to the update if provided and different from existing
            if user_name and (
                not existing_user[0].get("name")
                or existing_user[0].get("name") != user_name
            ):
                update_operations["$set"]["name"] = user_name

            # Add mood to the update if provided and different from existing
            if user_mood and (
                not existing_user[0].get("mood")
                or existing_user[0].get("mood") != user_mood
            ):
                update_operations["$set"]["mood"] = user_mood

            update_data(
                COLLECTIONS["USER_EMAIL_RECORDS"],
                {"email": user_email},
                update_operations,
                False,  # No upsert needed since user exists
            )
        else:
            # New user, create a new record
            new_user_data = {
                "email": user_email,
                "name": user_name,
                "mood": user_mood,
                "email_sent": True,
                "report_id": [report_id],  # Initialize as array with first report_id
            }

            insert_data(COLLECTIONS["USER_EMAIL_RECORDS"], new_user_data)

        return jsonify({"message": "Email sent successfully"}), 200
    else:
        return jsonify({"error": "Failed to send email"}), 500


@app.route("/api/booth/add/location", methods=["POST"])
@login_required(allowed_roles=["user", "admin"])
def add_booth():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "No data provided"}), 400

        save_res = add_booth_location(data)

        return jsonify(
            {
                "status": "success",
                "message": "Venue added successfully",
                "data": save_res,
            }
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/booth/update/location", methods=["POST"])
@login_required(allowed_roles=["user", "admin"])
def update_booth():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "No data provided"}), 400

        save_res = update_booth_location(data)

        return jsonify(
            {
                "status": "success",
                "message": "Venue added successfully",
                "data": save_res,
            }
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/booth/fetch/locations", methods=["GET"])
@login_required(allowed_roles=["user", "admin"])
def fetch_booths():
    try:
        venues = fetch_booth_locations()

        return jsonify(
            {
                "status": "success",
                "message": "Venues fetched successfully",
                "data": venues,
            }
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/fetch/support", methods=["GET"])
@login_required(allowed_roles=["user", "admin"])
def fetch():
    try:
        support = fetch_booth_locations()
        return jsonify(
            {
                "status": "success",
                "message": "Support data fetched successfully",
                "data": support,
            }
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/register", methods=["POST"])
def register():
    payload = request.get_json(force=True)

    return register_user(payload)


@app.route("/api/login", methods=["POST"])
def login():
    payload = request.get_json(force=True)

    return login_user(payload)


@app.route("/api/admin/register", methods=["POST"])
def admin_register():
    payload = request.get_json(force=True)

    return register_admin(payload)


@app.route("/logout", methods=["POST"])
def logout():
    # session.clear()
    return jsonify({"message": "Logged out successfully"}), 200


# Trial API endpoints for "try first" functionality
@app.route("/api/trial/start", methods=["POST"])
def start_trial():
    """Start a new trial session for anonymous users"""
    try:
        # Get IP address from request
        ip_address = request.remote_addr

        # Optional device fingerprint for additional security
        device_fingerprint = request.headers.get("X-Device-Fingerprint")

        # Create trial session
        trial_session = trial_service.create_trial_session(
            ip_address, device_fingerprint
        )

        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Trial session started successfully",
                    "data": trial_session,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


@app.route("/api/trial/video", methods=["POST"])
def process_trial_video():
    """Process video for trial users without authentication"""
    try:
        # Validate request
        if "videoFile" not in request.files:
            return (
                jsonify({"status": "error", "message": "No video file provided"}),
                400,
            )

        if "venue" not in request.form:
            return jsonify({"status": "error", "message": "No venue provided"}), 400

        if "language" not in request.form:
            return jsonify({"status": "error", "message": "No language provided"}), 400

        # if "ageRange" not in request.form:
        #     return jsonify({"status": "error", "message": "No age range provided"}), 400

        # if "gender" not in request.form:
        #     return jsonify({"status": "error", "message": "No gender provided"}), 400

        # if "email" not in request.form:
        #     return jsonify({"status": "error", "message": "No email provided"}), 400

        if "trial_id" not in request.form:
            return jsonify({"status": "error", "message": "No trial_id provided"}), 400

        file = request.files["videoFile"]
        trial_id = request.form["trial_id"]

        if file.filename == "":
            return (
                jsonify({"status": "error", "message": "No selected video file"}),
                400,
            )

        # Validate trial session exists and is active
        trial_session = trial_service.get_trial_session(trial_id)
        if not trial_session:
            return (
                jsonify(
                    {"status": "error", "message": "Invalid or expired trial session"}
                ),
                400,
            )

        # Prepare metadata for video processing
        metadata = {
            "trial_id": trial_id,
            "venue": request.form.get("venue"),
            "language": request.form.get("language"),
            # "ageRange": request.form.get("ageRange"),
            # "gender": request.form.get("gender"),
            # "email": request.form.get("email"),
        }

        # Process video using modified existing method with is_trial=True
        result = videoProcessingStart(file, metadata, is_trial=True)

        # Update trial session with video processing results
        update_success = trial_service.update_trial_video_data(trial_id, result)

        if not update_success:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Failed to update trial session with video data",
                    }
                ),
                500,
            )

        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Trial video processed successfully",
                    "data": result,
                }
            ),
            200,
        )

    except Exception as e:
        return (
            jsonify(
                {"status": "error", "message": f"Video processing failed: {str(e)}"}
            ),
            500,
        )


@app.route("/api/trial/audio", methods=["POST"])
def process_trial_audio():
    """Process audio for trial users without authentication"""
    try:
        # Validate request
        if "audioFile" not in request.files:
            return (
                jsonify({"status": "error", "message": "No audio file provided"}),
                400,
            )

        if "trial_id" not in request.form:
            return jsonify({"status": "error", "message": "No trial_id provided"}), 400

        file = request.files["audioFile"]
        trial_id = request.form["trial_id"]

        if file.filename == "":
            return (
                jsonify({"status": "error", "message": "No selected audio file"}),
                400,
            )

        # Validate trial session exists and is active
        trial_session = trial_service.get_trial_session(trial_id)
        if not trial_session:
            return (
                jsonify(
                    {"status": "error", "message": "Invalid or expired trial session"}
                ),
                400,
            )

        # Process audio using modified existing method with is_trial=True
        result = audioProcessingStart(file, trial_id, is_trial=True)

        # Update trial session with audio processing results
        update_success = trial_service.update_trial_audio_data(trial_id, result)

        if not update_success:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Failed to update trial session with audio data",
                    }
                ),
                500,
            )

        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Trial audio processed successfully",
                    "data": result,
                }
            ),
            200,
        )

    except Exception as e:
        return (
            jsonify(
                {"status": "error", "message": f"Audio processing failed: {str(e)}"}
            ),
            500,
        )


@app.route("/api/trial/report/<trial_id>", methods=["GET"])
def get_trial_report(trial_id):
    """Get the complete trial report after both video and audio processing"""
    try:
        if not trial_id:
            return (
                jsonify(
                    {"status": "error", "message": "trial_id parameter is required"}
                ),
                400,
            )

        # Get trial report
        report = trial_service.get_trial_report(trial_id)
        print(trial_id, "trial_id")
        if not report:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Trial report not found or processing incomplete",
                    }
                ),
                404,
            )

        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Trial report retrieved successfully",
                    "data": report,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/trial/link", methods=["POST"])
@login_required(allowed_roles=["user", "admin"])
def link_trial_to_user():
    """Link a trial report to a newly registered permanent user"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"status": "error", "message": "No data provided"}), 400

        trial_id = data.get("trial_id")
        user_id = data.get("user_id")
        email = data.get("email")

        if not all([trial_id, user_id, email]):
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "trial_id, user_id, and email are required",
                    }
                ),
                400,
            )

        # Link trial to user
        result = trial_service.link_trial_to_user(trial_id, user_id, email)

        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Trial report successfully linked to user account",
                    "data": result,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/trial/cleanup", methods=["POST"])
@login_required(allowed_roles=["admin"])
def cleanup_expired_trials():
    """Admin endpoint to manually trigger cleanup of expired trial sessions"""
    try:
        result = trial_service.cleanup_expired_trials()

        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Trial cleanup completed",
                    "data": result,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/trial/statistics", methods=["GET"])
@login_required(allowed_roles=["admin"])
def get_trial_statistics():
    """Admin endpoint to get trial usage statistics"""
    try:
        stats = trial_service.get_trial_statistics()

        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Trial statistics retrieved successfully",
                    "data": stats,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/shutdown", methods=["POST"])
def shutdown():
    """Shutdown the Flask server gracefully"""
    try:
        print("Received shutdown request via HTTP endpoint")

        def shutdown_server():
            print("Starting graceful server shutdown...")

            time.sleep(0.5)

            print("Stopping server...")

            print("Exiting process normally for PyInstaller cleanup...")
            sys.exit(0)

        shutdown_server()
        # shutdown_thread = threading.Thread(target=shutdown_server)
        # shutdown_thread.daemon = True
        # shutdown_thread.start()

        return (
            jsonify({"status": "success", "message": "Server shutdown initiated"}),
            200,
        )

    except Exception as e:
        print(f"Shutdown endpoint error: {e}")
        return (
            jsonify({"status": "error", "message": f"Shutdown failed: {str(e)}"}),
            500,
        )


if __name__ == "__main__":
    # Check if Electron is shutting down
    if os.getenv("ELECTRON_SHUTDOWN") == "1":
        print("Skipping Flask server start - Electron is shutting down")
        sys.exit(0)

    # Check if this is during PyInstaller build process
    # PyInstaller sets certain environment variables during analysis
    if (
        os.getenv("PYINSTALLER_BUILD") == "1"
        or os.getenv("PYTHONPATH")
        and "PyInstaller" in os.getenv("PYTHONPATH")
    ):
        print("Skipping Flask server start - PyInstaller build process detected")
        sys.exit(0)

    # If running in a build context (no actual server needed)
    if len(sys.argv) > 1 and sys.argv[1] in ["--build", "--analyze", "--pyinstaller"]:
        print("Skipping Flask server start - Build/analysis mode detected")
        sys.exit(0)

    # default port
    port = 5000

    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"Invalid port number: {sys.argv[1]}, using default port 5000")
    elif "PORT" in os.environ:
        try:
            port = int(os.environ["PORT"])
        except ValueError:
            print(
                f"Invalid PORT environment variable: {os.environ['PORT']}, using default port 5000"
            )

    print(f"Starting Flask server on port {port}")

    is_pyinstaller_bundle = getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS")

    if is_pyinstaller_bundle:
        debug_mode = False
        print("Running from PyInstaller bundle - debug mode disabled")
    else:
        debug_mode = os.getenv("FLASK_ENV") == "development"
        print(f"Debug mode: {debug_mode}")

    app.run(host="0.0.0.0", port=port, debug=debug_mode)
    # server_instance = make_server(host="0.0.0.0", port=port, app=app, threaded=True)
