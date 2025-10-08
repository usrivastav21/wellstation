from typing import Dict, Optional
from app.services.resources.profile_group_service import ProfileGroupService
from app.services.resources.youtube_service import YouTubeService
from .exceptions import (
    TrialUserRestrictedError,
    UserNotRegisteredError,
    MentalHealthScoresNotFoundError,
    PlaylistNotFoundError,
    ReportNotFoundError,
)


class ResourcesService:
    """Main service for managing video resources and recommendations"""

    def __init__(self):
        self.youtube_service = YouTubeService()

    def get_personalized_recommendations(self, report_id: str, limit: int = 3) -> Dict:
        """
        Get personalized video recommendations for a user based on their emotional profile
        Returns: {
            'emotional_profile_key': str,
            'emotional_profile_display': str,
            'playlist_id': str,
            'videos': List[Dict],
            'total_videos': int
        }
        """
        try:
            profile_data = ProfileGroupService.get_emotional_profile_from_report(
                report_id
            )

            emotional_profile_key = profile_data["emotional_profile_key"]
            display_name = profile_data["display_name"]
            playlist_id = profile_data["playlist_id"]

            if not playlist_id:
                raise PlaylistNotFoundError(
                    "No playlist found for emotional profile group"
                )

            all_videos = self.youtube_service.get_playlist_videos(playlist_id)

            recommended_videos = all_videos[:limit]

            return {
                "emotional_profile_key": emotional_profile_key,
                "emotional_profile_display": display_name,
                "playlist_id": playlist_id,
                "videos": recommended_videos,
                "total_videos": len(all_videos),
                "recommendations_count": len(recommended_videos),
            }

        except TrialUserRestrictedError as e:
            return {
                "error": "trial_user_restricted",
                "message": str(e),
                "emotional_profile_key": "",
                "emotional_profile_display": "",
                "playlist_id": "",
                "videos": [],
                "total_videos": 0,
                "recommendations_count": 0,
            }
        except (
            UserNotRegisteredError,
            MentalHealthScoresNotFoundError,
            PlaylistNotFoundError,
            ReportNotFoundError,
        ) as e:
            return {
                "error": "validation_error",
                "message": str(e),
                "emotional_profile_key": "mixed_emotions",
                "emotional_profile_display": "Mixed Emotions",
                "playlist_id": "",
                "videos": [],
                "total_videos": 0,
                "recommendations_count": 0,
            }
        except Exception as e:
            print(f"Error getting personalized recommendations: {e}")
            return {
                "error": "server_error",
                "message": "An error occurred while fetching recommendations. Please try again later.",
                "emotional_profile_key": "mixed_emotions",
                "emotional_profile_display": "Mixed Emotions",
                "playlist_id": "",
                "videos": [],
                "total_videos": 0,
                "recommendations_count": 0,
            }

    def get_full_playlist(self, playlist_id: str, max_results: int = 100) -> Dict:
        """
        Get all videos from a specific playlist
        """
        try:
            videos = self.youtube_service.get_playlist_videos(playlist_id, max_results)

            return {
                "playlist_id": playlist_id,
                "videos": videos,
                "total_videos": len(videos),
            }

        except Exception as e:
            print(f"Error getting full playlist: {e}")
            return {
                "playlist_id": playlist_id,
                "videos": [],
                "total_videos": 0,
                "error": str(e),
            }

    def get_video_by_id(self, video_id: str) -> Optional[Dict]:
        """
        Get detailed information about a specific video
        """
        try:
            return self.youtube_service.get_video_details(video_id)
        except Exception as e:
            print(f"Error getting video details: {e}")
            return None

    def get_playlist_by_report_id(self, report_id: str) -> Dict:
        """
        Get the full playlist associated with a user's emotional profile
        """
        try:
            profile_data = ProfileGroupService.get_emotional_profile_from_report(
                report_id
            )

            emotional_profile_key = profile_data["emotional_profile_key"]
            display_name = profile_data["display_name"]
            playlist_id = profile_data["playlist_id"]

            if not playlist_id:
                return {
                    "emotional_profile_key": emotional_profile_key,
                    "emotional_profile_display": display_name,
                    "playlist_id": "",
                    "videos": [],
                    "total_videos": 0,
                    "error": "No playlist found for emotional profile group",
                }

            playlist_data = self.get_full_playlist(playlist_id)
            playlist_data["emotional_profile_key"] = emotional_profile_key
            playlist_data["emotional_profile_display"] = display_name

            return playlist_data

        except TrialUserRestrictedError as e:
            return {
                "error": "trial_user_restricted",
                "message": str(e),
                "emotional_profile_key": "",
                "emotional_profile_display": "",
                "playlist_id": "",
                "videos": [],
                "total_videos": 0,
            }
        except (
            UserNotRegisteredError,
            MentalHealthScoresNotFoundError,
            PlaylistNotFoundError,
            ReportNotFoundError,
        ) as e:
            return {
                "error": "validation_error",
                "message": str(e),
                "emotional_profile_key": "",
                "emotional_profile_display": "",
                "playlist_id": "",
                "videos": [],
                "total_videos": 0,
            }
        except Exception as e:
            print(f"Error getting playlist by report ID: {e}")
            return {
                "emotional_profile_key": "",
                "emotional_profile_display": "",
                "playlist_id": "",
                "videos": [],
                "total_videos": 0,
                "error": str(e),
            }
