from typing import List, Dict, Optional
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from config import Config


class YouTubeService:
    """Service for interacting with YouTube Data API v3"""

    def __init__(self):
        self.api_key = Config.YOUTUBE_API_KEY
        if not self.api_key:
            raise ValueError("YouTube API key not configured")

        self.youtube = build("youtube", "v3", developerKey=self.api_key)

    def get_playlist_videos(
        self, playlist_id: str, max_results: int = 50
    ) -> List[Dict]:
        """
        Fetch videos from a YouTube playlist
        Returns list of video objects with metadata
        """
        try:
            playlist_response = (
                self.youtube.playlistItems()
                .list(
                    part="snippet,contentDetails",
                    playlistId=playlist_id,
                    maxResults=max_results,
                )
                .execute()
            )

            # Get playlist channel title (the curator of the playlist)
            playlist_channel_title = (
                playlist_response.get("items", [{}])[0]
                .get("snippet", {})
                .get("channelTitle", "Unknown Channel")
            )

            video_ids = [
                item["contentDetails"]["videoId"] for item in playlist_response["items"]
            ]

            if not video_ids:
                return []

            videos_response = (
                self.youtube.videos()
                .list(part="snippet,contentDetails,statistics", id=",".join(video_ids))
                .execute()
            )

            videos = []
            for video in videos_response["items"]:
                duration = YouTubeService._format_duration(
                    video["contentDetails"]["duration"]
                )

                video_data = {
                    "id": video["id"],
                    "title": video["snippet"]["title"],
                    "description": (
                        video["snippet"]["description"][:200] + "..."
                        if len(video["snippet"]["description"]) > 200
                        else video["snippet"]["description"]
                    ),
                    "thumbnail": video["snippet"]["thumbnails"]["high"]["url"],
                    "duration": duration,
                    "playlist_channel_title": playlist_channel_title,  # Single channel name for all videos
                    "individual_video_creator": video["snippet"][
                        "channelTitle"
                    ],  # Individual video creator (for reference)
                    "published_at": video["snippet"]["publishedAt"],
                    "view_count": video["statistics"].get("viewCount", 0),
                    "like_count": video["statistics"].get("likeCount", 0),
                }
                videos.append(video_data)

            return videos

        except HttpError as e:
            print(f"YouTube API error: {e}")
            return []
        except Exception as e:
            print(f"Error fetching playlist videos: {e}")
            return []

    def get_video_details(self, video_id: str) -> Optional[Dict]:
        """
        Get detailed information about a specific video
        """
        try:
            response = (
                self.youtube.videos()
                .list(part="snippet,contentDetails,statistics", id=video_id)
                .execute()
            )

            if not response["items"]:
                return None

            video = response["items"][0]
            duration = YouTubeService._format_duration(
                video["contentDetails"]["duration"]
            )

            return {
                "id": video["id"],
                "title": video["snippet"]["title"],
                "description": video["snippet"]["description"],
                "thumbnail": video["snippet"]["thumbnails"]["high"]["url"],
                "duration": duration,
                "playlist_channel_title": "Individual Video",  # Since this is not from a playlist context
                "individual_video_creator": video["snippet"][
                    "channelTitle"
                ],  # Individual video creator
                "published_at": video["snippet"]["publishedAt"],
                "view_count": video["statistics"].get("viewCount", 0),
                "like_count": video["statistics"].get("likeCount", 0),
                "embed_url": f"https://www.youtube.com/embed/{video['id']}",
            }

        except HttpError as e:
            print(f"YouTube API error: {e}")
            return None
        except Exception as e:
            print(f"Error fetching video details: {e}")
            return None

    @staticmethod
    def _format_duration(duration: str) -> str:
        """
        Convert ISO 8601 duration to readable format (e.g., PT3M45S -> 3:45)
        """
        import re

        duration = duration.replace("PT", "")

        hours = 0
        minutes = 0
        seconds = 0

        hour_match = re.search(r"(\d+)H", duration)
        if hour_match:
            hours = int(hour_match.group(1))
            duration = duration.replace(hour_match.group(0), "")

        minute_match = re.search(r"(\d+)M", duration)
        if minute_match:
            minutes = int(minute_match.group(1))
            duration = duration.replace(minute_match.group(0), "")

        second_match = re.search(r"(\d+)S", duration)
        if second_match:
            seconds = int(second_match.group(1))

        # Format output
        if hours > 0:
            return f"{hours}:{minutes:02d}:{seconds:02d}"
        else:
            return f"{minutes}:{seconds:02d}"
