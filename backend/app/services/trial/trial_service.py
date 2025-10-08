import uuid
import os
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any

from app.db.collections import COLLECTIONS
from app.db.operations import insert_data, find_data, update_data
from app.services.report.reward_points_service import calculate_rewards


class TrialService:
    """Service for managing trial user sessions and reports"""

    def __init__(self):
        # Trial session expires after 7 days
        self.trial_expiry_days = 7
        # Maximum trial attempts per IP address per day
        self.max_trials_per_ip_per_day = 5

    def generate_trial_id(self) -> str:
        """Generate a unique trial session identifier"""
        return f"trial_{uuid.uuid4().hex[:12]}"

    def create_trial_session(
        self, ip_address: str, device_fingerprint: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a new trial session

        Args:
            ip_address: IP address of the trial user
            device_fingerprint: Optional device identifier for abuse prevention

        Returns:
            Dictionary containing trial_id and session details
        """
        # Check rate limiting for this IP. Currently don't need this
        # if not self._check_rate_limit(ip_address):
        #     raise Exception(
        #         "Rate limit exceeded. Too many trial attempts from this IP address."
        #     )

        trial_id = self.generate_trial_id()
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(days=self.trial_expiry_days)

        trial_session = {
            "trial_id": trial_id,
            "timestamp": now,
            "created_at": now,
            "expires_at": expires_at,
            "status": "active",
            "ip_address": ip_address,
            "device_fingerprint": device_fingerprint,
            "processing_stage": "initialized",  # initialized, video_processed, audio_processed, completed
            "venue": None,
            "language": None,
            "ageRange": None,
            "gender": None,
            "email": None,
            "vital_signs": None,
            "mental_health_scores": None,
            "linked_user_id": None,
            "linked_at": None,
        }

        try:
            insert_data(COLLECTIONS["TRIAL_REPORTS"], trial_session)
            return {
                "trial_id": trial_id,
                "expires_at": expires_at,  # Return datetime object, not string
                "status": "active",
            }
        except Exception as e:
            raise Exception(f"Failed to create trial session: {str(e)}")

    def get_trial_session(self, trial_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a trial session by trial_id

        Args:
            trial_id: The trial session identifier

        Returns:
            Trial session data or None if not found
        """
        try:
            result = find_data(
                COLLECTIONS["TRIAL_REPORTS"], {"trial_id": trial_id}, limit=1
            )
            if result:
                trial_data = result[0]
                print(
                    f"Debug: Retrieved trial data for {trial_id}: {trial_data.get('status')}"
                )
                print(
                    f"Debug: expires_at type: {type(trial_data.get('expires_at'))}, value: {trial_data.get('expires_at')}"
                )

                # Check if trial has expired
                if self._is_trial_expired(trial_data):
                    print(f"Debug: Trial {trial_id} has expired, marking as expired")
                    self._mark_trial_expired(trial_id)
                    return None

                print(f"Debug: Trial {trial_id} is active and not expired")
                return trial_data
            else:
                print(f"Debug: No trial found for {trial_id}")
            return None
        except Exception as e:
            print(f"Debug: Error in get_trial_session for {trial_id}: {str(e)}")
            raise Exception(f"Failed to retrieve trial session: {str(e)}")

    def update_trial_video_data(
        self, trial_id: str, video_data: Dict[str, Any]
    ) -> bool:
        """
        Update trial session with video processing results

        Args:
            trial_id: The trial session identifier
            video_data: Dictionary containing video processing results

        Returns:
            True if successful, False otherwise
        """
        try:
            # Validate trial session exists and is active
            trial_session = self.get_trial_session(trial_id)
            if not trial_session:
                raise Exception("Trial session not found or expired")

            if trial_session["status"] != "active":
                raise Exception("Trial session is not active")

            # Update with video data
            update_operations = {
                "$set": {
                    "venue": video_data.get("venue"),
                    "language": video_data.get("language"),
                    "ageRange": video_data.get("ageRange"),
                    "gender": video_data.get("gender"),
                    "email": video_data.get("email"),
                    "vital_signs": video_data.get("vital_signs"),
                    "processing_stage": "video_processed",
                    "updated_at": datetime.now(timezone.utc),
                }
            }

            result = update_data(
                COLLECTIONS["TRIAL_REPORTS"], {"trial_id": trial_id}, update_operations
            )

            return result is not None

        except Exception as e:
            raise Exception(f"Failed to update trial video data: {str(e)}")

    def update_trial_audio_data(
        self, trial_id: str, audio_data: Dict[str, Any]
    ) -> bool:
        """
        Update trial session with audio processing results

        Args:
            trial_id: The trial session identifier
            audio_data: Dictionary containing audio processing results

        Returns:
            True if successful, False otherwise
        """
        try:
            # Validate trial session exists and is active
            trial_session = self.get_trial_session(trial_id)
            if not trial_session:
                raise Exception("Trial session not found or expired")

            if trial_session["status"] != "active":
                raise Exception("Trial session is not active")

            # Update with audio data
            update_operations = {
                "$set": {
                    "mental_health_scores": audio_data.get("mental_health_scores"),
                    "processing_stage": "audio_processed",
                    "updated_at": datetime.now(timezone.utc),
                }
            }

            result = update_data(
                COLLECTIONS["TRIAL_REPORTS"], {"trial_id": trial_id}, update_operations
            )

            return result is not None

        except Exception as e:
            raise Exception(f"Failed to update trial audio data: {str(e)}")

    def get_trial_report(self, trial_id: str) -> Optional[Dict[str, Any]]:
        """
        Get the complete trial report

        Args:
            trial_id: The trial session identifier

        Returns:
            Complete trial report or None if not found
        """
        try:
            trial_data = self.get_trial_session(trial_id)
            if not trial_data:
                return None

            # Check if both video and audio processing are complete
            if trial_data["processing_stage"] != "completed":
                raise Exception(
                    "Trial processing not complete. Both video and audio must be processed."
                )

            # Format the report for display
            report = {
                "trial_id": trial_data["trial_id"],
                "timestamp": trial_data["timestamp"],
                "venue": trial_data["venue"],
                "language": trial_data["language"],
                "ageRange": trial_data["ageRange"],
                "gender": trial_data["gender"],
                "vital_signs": trial_data["vital_signs"],
                "mental_health_scores": trial_data["mental_health_scores"],
                "status": "ready_for_registration",
            }

            return report

        except Exception as e:
            raise Exception(f"Failed to get trial report: {str(e)}")

    def link_trial_to_user(
        self, trial_id: str, user_id: str, email: str
    ) -> Dict[str, Any]:
        """
        Link a trial report to a newly registered permanent user

        Args:
            trial_id: The trial session identifier
            user_id: The permanent user ID
            email: The user's email address

        Returns:
            Dictionary containing linking result and user data
        """
        try:
            trial_data = self.get_trial_session(trial_id)
            if not trial_data:
                raise Exception("Trial session not found or expired")

            if trial_data["status"] != "active":
                raise Exception("Trial session is not active")

            if trial_data.get("email") and trial_data["email"] != email:
                raise Exception("Email address does not match trial session")

            user_report = {
                "user_id": user_id,
                "report_id": trial_id,
                "trial_id": trial_id,
                "venue": trial_data["venue"],
                "language": trial_data["language"],
                "ageRange": trial_data["ageRange"],
                "gender": trial_data["gender"],
                "email": email,
                "vital_signs": trial_data["vital_signs"],
                "mental_health_scores": trial_data["mental_health_scores"],
                "created_from_trial": True,
                "created_at": datetime.now(timezone.utc),
            }

            user_report_result = insert_data(COLLECTIONS["USERS"], user_report)

            update_data(
                COLLECTIONS["TRIAL_REPORTS"],
                {"trial_id": trial_id},
                {
                    "$set": {
                        "status": "completed",
                        "linked_user_id": user_id,
                        "linked_at": datetime.now(timezone.utc),
                        "processing_stage": "completed",
                    }
                },
            )

            calculate_rewards(email, datetime.now(timezone.utc))

            return {
                "success": True,
                "message": "Trial report successfully linked to user account",
                "report_id": str(user_report_result["report_id"]),
                "trial_id": str(trial_id),
            }

        except Exception as e:
            raise Exception(f"Failed to link trial to user: {str(e)}")

    def cleanup_expired_trials(self) -> Dict[str, Any]:
        """
        Clean up expired trial sessions and their associated files

        Returns:
            Dictionary containing cleanup results
        """
        try:
            now = datetime.now(timezone.utc)
            expired_trials = find_data(
                COLLECTIONS["TRIAL_REPORTS"],
                {"expires_at": {"$lt": now}},
                limit=100,  # Process in batches
            )

            cleaned_count = 0
            for trial in expired_trials:
                trial_id = trial["trial_id"]

                # Clean up associated files
                self._cleanup_trial_files(trial_id)

                # Mark as expired in database
                update_data(
                    COLLECTIONS["TRIAL_REPORTS"],
                    {"trial_id": trial_id},
                    {"$set": {"status": "expired"}},
                )

                cleaned_count += 1

            return {
                "success": True,
                "message": f"Cleaned up {cleaned_count} expired trial sessions",
                "cleaned_count": cleaned_count,
            }

        except Exception as e:
            raise Exception(f"Failed to cleanup expired trials: {str(e)}")

    def get_trial_statistics(self) -> Dict[str, Any]:
        """
        Get statistics about trial usage

        Returns:
            Dictionary containing trial statistics
        """
        try:
            total_trials = len(find_data(COLLECTIONS["TRIAL_REPORTS"], {}))

            active_trials = len(
                find_data(COLLECTIONS["TRIAL_REPORTS"], {"status": "active"})
            )

            completed_trials = len(
                find_data(COLLECTIONS["TRIAL_REPORTS"], {"status": "completed"})
            )

            expired_trials = len(
                find_data(COLLECTIONS["TRIAL_REPORTS"], {"status": "expired"})
            )

            conversion_rate = (
                (completed_trials / total_trials * 100) if total_trials > 0 else 0
            )

            return {
                "total_trials": total_trials,
                "active_trials": active_trials,
                "completed_trials": completed_trials,
                "expired_trials": expired_trials,
                "conversion_rate": round(conversion_rate, 2),
            }

        except Exception as e:
            raise Exception(f"Failed to get trial statistics: {str(e)}")

    def _check_rate_limit(self, ip_address: str) -> bool:
        """
        Check if IP address has exceeded trial creation rate limit

        Args:
            ip_address: IP address to check

        Returns:
            True if within rate limit, False otherwise
        """
        try:
            yesterday = datetime.now(timezone.utc) - timedelta(days=1)
            recent_trials = find_data(
                COLLECTIONS["TRIAL_REPORTS"],
                {"ip_address": ip_address, "created_at": {"$gte": yesterday}},
            )

            return len(recent_trials) < self.max_trials_per_ip_per_day

        except Exception as e:
            print(f"Warning: Rate limiting check failed: {e}")
            return True

    def _normalize_datetime(self, dt_value) -> datetime:
        """
        Normalize datetime values to ensure consistent timezone handling

        Args:
            dt_value: Datetime value (can be string, datetime, or None)

        Returns:
            Normalized timezone-aware datetime object
        """
        if dt_value is None:
            return None

        if isinstance(dt_value, str):
            if dt_value.endswith("Z"):
                dt_value = dt_value.replace("Z", "+00:00")
            return datetime.fromisoformat(dt_value)
        elif isinstance(dt_value, datetime):
            if dt_value.tzinfo is None:
                return dt_value.replace(tzinfo=timezone.utc)
            return dt_value
        else:
            raise ValueError(f"Invalid datetime value: {dt_value}")

    def _is_trial_expired(self, trial_data: Dict[str, Any]) -> bool:
        """
        Check if a trial session has expired

        Args:
            trial_data: Trial session data

        Returns:
            True if expired, False otherwise
        """
        if "expires_at" not in trial_data:
            return True

        try:
            expires_at = self._normalize_datetime(trial_data["expires_at"])
            if expires_at is None:
                return True

            now = datetime.now(timezone.utc)

            return now > expires_at

        except Exception as e:
            print(f"Warning: Error parsing trial expiration date: {e}")
            return True

    def _mark_trial_expired(self, trial_id: str) -> None:
        """
        Mark a trial session as expired

        Args:
            trial_id: The trial session identifier
        """
        try:
            update_data(
                COLLECTIONS["TRIAL_REPORTS"],
                {"trial_id": trial_id},
                {"$set": {"status": "expired"}},
            )
        except Exception:
            pass

    def _cleanup_trial_files(self, trial_id: str) -> None:
        """
        Clean up files associated with a trial session

        Args:
            trial_id: The trial session identifier
        """
        try:
            media_dir = os.path.join(os.getcwd(), "media", f"trial_{trial_id}")
            if os.path.exists(media_dir):
                self._remove_directory(media_dir)

            processing_dirs = [
                os.path.join(
                    os.getcwd(), "processingScripts", "features", f"trial_{trial_id}"
                ),
                os.path.join(
                    os.getcwd(),
                    "processingScripts",
                    "model_outputs",
                    f"trial_{trial_id}",
                ),
                os.path.join(
                    os.getcwd(),
                    "processingScripts",
                    "final_outputs",
                    f"trial_{trial_id}",
                ),
            ]

            for directory in processing_dirs:
                if os.path.exists(directory):
                    self._remove_directory(directory)

        except Exception:
            pass

    def _remove_directory(self, path: str) -> None:
        """
        Recursively remove a directory and its contents

        Args:
            path: Path to the directory to remove
        """
        try:
            if os.path.exists(path):
                for root, dirs, files in os.walk(path, topdown=False):
                    for name in files:
                        os.remove(os.path.join(root, name))
                    for name in dirs:
                        os.rmdir(os.path.join(root, name))
                os.rmdir(path)
        except Exception:
            pass


# Create a global instance for easy access
trial_service = TrialService()
