from flask import Blueprint, jsonify, request
from app.services.resources.resources_service import ResourcesService
from app.services.resources.exceptions import (
    TrialUserRestrictedError,
    UserNotRegisteredError,
    MentalHealthScoresNotFoundError,
    PlaylistNotFoundError,
    ReportNotFoundError,
)
from app.validations.login_required import login_required

resources_bp = Blueprint("resources", __name__)
resources_service = ResourcesService()


@resources_bp.route("/api/resources/recommendations/<report_id>", methods=["GET"])
@login_required(allowed_roles=["admin", "user"])
def get_personalized_recommendations(report_id):
    """
    Get personalized video recommendations for a user based on their emotional profile
    """
    try:
        limit = request.args.get("limit", 3, type=int)

        recommendations = resources_service.get_personalized_recommendations(
            report_id, limit
        )

        if "error" in recommendations:
            error_type = recommendations["error"]

            if error_type == "trial_user_restricted":
                return (
                    jsonify(
                        {
                            "success": False,
                            "error": "trial_user_restricted",
                            "message": recommendations["message"],
                        }
                    ),
                    403,
                )

            elif error_type == "validation_error":
                return (
                    jsonify(
                        {
                            "success": False,
                            "error": "validation_error",
                            "message": recommendations["message"],
                        }
                    ),
                    400,
                )

            elif error_type == "server_error":
                return (
                    jsonify(
                        {
                            "success": False,
                            "error": "server_error",
                            "message": recommendations["message"],
                        }
                    ),
                    500,
                )

        return jsonify({"success": True, "data": recommendations})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@resources_bp.route("/api/resources/playlist/<playlist_id>", methods=["GET"])
@login_required(allowed_roles=["admin", "user"])
def get_playlist_videos(playlist_id):
    """
    Get all videos from a specific YouTube playlist
    """
    try:
        max_results = request.args.get("max_results", 100, type=int)

        playlist = resources_service.get_full_playlist(playlist_id, max_results)

        if "error" in playlist:
            return jsonify({"success": False, "error": playlist["error"]}), 400

        return jsonify({"success": True, "data": playlist})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@resources_bp.route("/api/resources/video/<video_id>", methods=["GET"])
@login_required(allowed_roles=["admin", "user"])
def get_video_details(video_id):
    """
    Get detailed information about a specific video
    """
    try:
        video = resources_service.get_video_by_id(video_id)

        if not video:
            return jsonify({"success": False, "error": "Video not found"}), 404

        return jsonify({"success": True, "data": video})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@resources_bp.route("/api/resources/report/<report_id>/playlist", methods=["GET"])
@login_required(allowed_roles=["admin", "user"])
def get_user_playlist(report_id):
    """
    Get the full playlist associated with a user's emotional profile
    """
    try:
        playlist = resources_service.get_playlist_by_report_id(report_id)

        # Check for specific error types
        if "error" in playlist:
            error_type = playlist["error"]

            if error_type == "trial_user_restricted":
                return (
                    jsonify(
                        {
                            "success": False,
                            "error": "trial_user_restricted",
                            "message": playlist["message"],
                        }
                    ),
                    403,
                )  # Forbidden - trial users cannot access resources

            elif error_type == "validation_error":
                return (
                    jsonify(
                        {
                            "success": False,
                            "error": "validation_error",
                            "message": playlist["message"],
                        }
                    ),
                    400,
                )  # Bad Request

            else:
                return jsonify({"success": False, "error": playlist["error"]}), 400

        return jsonify({"success": True, "data": playlist})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@resources_bp.route("/api/resources/emotional-profile/<report_id>", methods=["GET"])
@login_required(allowed_roles=["admin", "user"])
def get_user_emotional_profile(report_id):
    """
    Get the emotional profile group and playlist ID for a user's report
    """
    try:
        from app.services.resources.profile_group_service import ProfileGroupService

        profile_data = ProfileGroupService.get_emotional_profile_from_report(report_id)

        return jsonify(
            {
                "success": True,
                "data": profile_data,
            }
        )

    except TrialUserRestrictedError as e:
        return (
            jsonify(
                {
                    "success": False,
                    "error": "trial_user_restricted",
                    "message": str(e),
                }
            ),
            403,
        )
    except (
        UserNotRegisteredError,
        MentalHealthScoresNotFoundError,
        PlaylistNotFoundError,
        ReportNotFoundError,
    ) as e:
        return (
            jsonify({"success": False, "error": "validation_error", "message": str(e)}),
            400,
        )
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
