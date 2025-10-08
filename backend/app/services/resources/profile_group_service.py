from typing import Dict
from app.db.collections import COLLECTIONS
from app.db.operations import find_data
from .playlist_config import EMOTIONAL_PROFILE_PLAYLISTS
from .exceptions import (
    TrialUserRestrictedError,
    UserNotRegisteredError,
    MentalHealthScoresNotFoundError,
    PlaylistNotFoundError,
    ReportNotFoundError,
)


class ProfileGroupService:
    """Service for determining emotional profile groups based on mental health levels"""

    @staticmethod
    def determine_emotional_profile_group(
        stress_level: str, anxiety_level: str, depression_level: str
    ) -> str:
        """
        Determine emotional profile group based on mental health levels
        Returns the emotional profile group key (snake_case)
        """
        profile_mapping = {
            ("low", "low", "low"): "green",
            ("low", "low", "medium"): "green",
            ("low", "low", "high"): "yellow",
            ("low", "medium", "low"): "green",
            ("low", "medium", "medium"): "yellow",
            ("low", "medium", "high"): "yellow",
            ("low", "high", "low"): "yellow",
            ("low", "high", "medium"): "yellow",
            ("low", "high", "high"): "red",
            ("medium", "low", "low"): "green",
            ("medium", "low", "medium"): "green",
            ("medium", "low", "high"): "yellow",
            ("medium", "medium", "low"): "green",
            ("medium", "medium", "medium"): "yellow",
            ("medium", "medium", "high"): "red",
            ("medium", "high", "low"): "yellow",
            ("medium", "high", "medium"): "red",
            ("medium", "high", "high"): "red",
            ("high", "low", "low"): "green",
            ("high", "low", "medium"): "yellow",
            ("high", "low", "high"): "yellow",
            ("high", "medium", "low"): "yellow",
            ("high", "medium", "medium"): "yellow",
            ("high", "medium", "high"): "red",
            ("high", "high", "low"): "yellow",
            ("high", "high", "medium"): "red",
            ("high", "high", "high"): "red",
        }

        stress = stress_level.lower()
        anxiety = anxiety_level.lower()
        depression = depression_level.lower()

        return profile_mapping.get((stress, anxiety, depression), "mixed_emotions")

    @staticmethod
    def get_playlist_id(emotional_profile_key: str) -> str:
        """Get YouTube playlist ID for a given emotional profile key"""
        playlist_id = EMOTIONAL_PROFILE_PLAYLISTS.get(emotional_profile_key, "")
        if not playlist_id:
            raise PlaylistNotFoundError(
                f"No playlist found for emotional profile: {emotional_profile_key}"
            )
        return playlist_id

    @staticmethod
    def get_display_name(emotional_profile_key: str) -> str:
        """Convert snake_case key to human-readable display name"""
        display_names = {
            "green": "Green",
            "yellow": "Yellow",
            "red": "Red",
        }
        return display_names.get(emotional_profile_key, "yellow")

    @staticmethod
    def _is_registered_user(report_id: str) -> bool:
        """
        Check if the report belongs to a registered user (not a trial user)
        Returns True if registered user, False if trial user
        """
        try:
            # First check if it's a trial report
            trial_data = find_data(
                COLLECTIONS["TRIAL_REPORTS"], {"trial_id": report_id}, limit=1
            )

            if trial_data:
                trial = trial_data[0]

                # Check if trial is linked to a registered user
                if trial.get("linked_user_id") and trial.get("status") == "completed":
                    # Trial is linked to a registered user, so they can access resources
                    return True
                else:
                    # Trial is not linked to a registered user, so they cannot access resources
                    return False

            # Check if it's a user report (registered user)
            user_data = find_data(COLLECTIONS["USERS"], {"user_Id": report_id}, limit=1)

            if user_data:
                # This is a user report (registered user)
                return True

            # If we can't find the report, assume it's not accessible
            return False

        except Exception as e:
            print(f"Error checking if user is registered: {e}")
            return False

    @staticmethod
    def get_emotional_profile_from_report(report_id: str) -> Dict[str, str]:
        """
        Get emotional profile group and playlist ID from a report
        Returns: {
            'emotional_profile_key': str,
            'display_name': str,
            'playlist_id': str
        }
        """
        try:
            # First check if this is a registered user (not a trial user)
            if not ProfileGroupService._is_registered_user(report_id):
                raise TrialUserRestrictedError(
                    "Resources are only available for registered users. Trial users cannot access this feature."
                )

            # For registered users, try to get data from USERS collection first
            user_data = find_data(COLLECTIONS["USERS"], {"user_Id": report_id}, limit=1)

            if user_data:
                user_report = user_data[0]
                mental_health_scores = user_report.get("mental_health_scores", {})

                if not mental_health_scores:
                    raise MentalHealthScoresNotFoundError(
                        "Mental health scores not found in user report"
                    )

            else:
                # Check if it's a linked trial (trial that was converted to registered user)
                trial_data = find_data(
                    COLLECTIONS["TRIAL_REPORTS"], {"trial_id": report_id}, limit=1
                )

                if not trial_data:
                    raise ReportNotFoundError(f"Report not found: {report_id}")

                trial = trial_data[0]

                # Verify this trial is linked to a registered user
                if (
                    not trial.get("linked_user_id")
                    or trial.get("status") != "completed"
                ):
                    raise UserNotRegisteredError(
                        "Trial report is not properly linked to a registered user"
                    )

                mental_health_scores = trial.get("mental_health_scores", {})

                if not mental_health_scores:
                    raise MentalHealthScoresNotFoundError(
                        "Mental health scores not found in trial report"
                    )

            # The levels should already be "low", "medium", or "high" from your existing system
            stress_level = mental_health_scores.get("stress", "medium")
            anxiety_level = mental_health_scores.get("anxiety", "medium")
            depression_level = mental_health_scores.get("depression", "medium")

            # Determine emotional profile group key
            emotional_profile_key = (
                ProfileGroupService.determine_emotional_profile_group(
                    stress_level, anxiety_level, depression_level
                )
            )

            # Get display name
            display_name = ProfileGroupService.get_display_name(emotional_profile_key)

            # Get playlist ID
            playlist_id = ProfileGroupService.get_playlist_id(emotional_profile_key)

            return {
                "emotional_profile_key": emotional_profile_key,
                "display_name": display_name,
                "playlist_id": playlist_id,
            }

        except (
            TrialUserRestrictedError,
            UserNotRegisteredError,
            MentalHealthScoresNotFoundError,
            PlaylistNotFoundError,
            ReportNotFoundError,
        ):
            # Re-raise these specific exceptions
            raise
        except Exception as e:
            print(f"Error getting emotional profile from report: {e}")
            # Return default group for unexpected errors
            return {
                "emotional_profile_key": "yellow",
                "display_name": "Yellow",
                "playlist_id": EMOTIONAL_PROFILE_PLAYLISTS.get("yellow", ""),
            }
