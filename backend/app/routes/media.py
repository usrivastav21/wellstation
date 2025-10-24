from datetime import datetime, timezone
from flask import Blueprint, request
from app.db.collections import COLLECTIONS
from app.db.operations import find_data
from app.services.media.media import videoProcessingStart, audioProcessingStart
from app.services.report.reward_points_service import calculate_rewards

media_bp = Blueprint("media", __name__)


# Common validation logic for file uploads
def validate_file_request(file_key, file_type):
    if file_key not in request.files:
        return False, {"error": f"No {file_type} file part"}, 400

    file = request.files[file_key]
    if file.filename == "":
        return False, {"error": f"No selected {file_type} file"}, 400

    if "userId" not in request.form:
        return False, {"error": "No userId provided"}, 400

    metadata = {"userId": request.form["userId"]}
    if file_type == "video":
        if "venue" not in request.form:
            return False, {"error": "No venue provided"}, 400

        if "language" not in request.form:
            return False, {"error": "No language provided"}, 400

        if "ageRange" not in request.form:
            return False, {"error": "No age range provided"}, 400

        if "gender" not in request.form:
            return False, {"error": "No gender provided"}, 400

        if "email" not in request.form:
            return False, {"error": "No email provided"}, 400

        metadata.update(
            {
                "venue": request.form["venue"],
                "language": request.form["language"],
                "ageRange": request.form["ageRange"],
                "gender": request.form["gender"],
                "email": request.form["email"],
            }
        )

    return True, file, metadata


@media_bp.route('/video', methods=['POST'])
def process_video():
    is_valid, response_or_file, status_or_metadata = validate_file_request(
        "videoFile", "video"
    )
    if not is_valid:
        return {"success": False, "error": response_or_file}, status_or_metadata

    file, metadata = response_or_file, status_or_metadata

    try:
        result = videoProcessingStart(file, metadata)
        if not isinstance(metadata, int) and isinstance(metadata["email"], str):
            calculate_rewards(metadata["email"], datetime.now(timezone.utc))

        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "error": f"Processing failed: {str(e)}"}, 500


@media_bp.route('/audio', methods=['POST'])
def process_audio():
    print("process_audio start")
    # Validate request
    # is_valid, response_or_file, status_or_userId = validate_file_request('audioFile', 'audio')
    # if not is_valid:
    #     return response_or_file, status_or_userId

    # file, userId = response_or_file, status_or_userId

    file = request.files["audioFile"]
    userId = request.form["userId"]

    # Process audio
    try:
        result = audioProcessingStart(file, userId, is_trial=False)
        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "error": f"Processing failed: {str(e)}"}, 500


@media_bp.route('/fetch/report/<user_id>', methods=['GET'])
def fetch_user_report_by_id(user_id):
    search_query = {
        "user_Id": user_id,
    }
    report = find_data(COLLECTIONS["USERS"], search_query, 1)

    # Convert ObjectId to string if present in the report
    if report and len(report) > 0 and "_id" in report[0]:
        report[0]["_id"] = str(report[0]["_id"])

    return report
