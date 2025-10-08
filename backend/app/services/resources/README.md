# Resources Service

This service provides personalized video recommendations based on users' mental health assessment results.

## Overview

The Resources Service maps mental health scores (stress, anxiety, depression) to emotional profile groups, which are then linked to specific YouTube playlists. Users receive personalized video recommendations based on their emotional profile.

**Important**: This service is only available for **registered users**. Trial users cannot access resources and will receive appropriate error messages.

## Architecture

### Components

1. **ProfileGroupService** - Maps mental health levels to emotional profile groups
2. **YouTubeService** - Interfaces with YouTube Data API v3
3. **ResourcesService** - Main orchestrator for video recommendations
4. **API Routes** - REST endpoints for frontend integration

### Data Flow

```
User Report → Check User Status → Fetch Data from Appropriate Collection → Mental Health Scores → Emotional Profile Group → YouTube Playlist → Video Recommendations
```

### User Access Control

The service implements strict access control:

- **Registered Users**: Full access to all resources and recommendations
  - Data fetched from `USERS` collection
  - Direct access to mental health scores and recommendations
- **Trial Users**: No access to resources (returns 403 Forbidden)
  - Completely blocked from accessing resources
- **Linked Trials**: Trials that have been converted to registered users can access resources
  - Data fetched from `TRIAL_REPORTS` collection (with verification of linked status)
  - Must have `linked_user_id` and `status: "completed"`

### Data Retrieval Logic

The service intelligently determines where to fetch user data:

1. **Primary Check**: Look in `USERS` collection for registered user reports
2. **Fallback Check**: If not found in users, check `TRIAL_REPORTS` for linked trials
3. **Validation**: Ensure linked trials are properly connected to registered users
4. **Access Denial**: Block all other trial users from accessing resources

## Emotional Profile Groups

The system maps 27 combinations of mental health levels to emotional profile groups:

| Stress | Anxiety | Depression | Emotional Profile Group  |
| ------ | ------- | ---------- | ------------------------ |
| Low    | Low     | Low        | Feeling Good             |
| Low    | Low     | Medium     | A Little Blue            |
| Low    | Low     | High       | Tired and Down           |
| Low    | Medium  | Low        | Calm but Cautious        |
| Low    | Medium  | Medium     | Mildly Concerned         |
| Low    | Medium  | High       | Struggling a Bit         |
| Low    | High    | Low        | Racing Mind              |
| Low    | High    | Medium     | Anxious but Hopeful      |
| Low    | High    | High       | Overwhelmed              |
| Medium | Low     | Low        | Getting By, But Watchful |
| Medium | Low     | Medium     | Slightly Burdened        |
| Medium | Low     | High       | Moderately Down          |
| Medium | Medium  | Low        | Balanced but Tense       |
| Medium | Medium  | Medium     | Mixed Emotions           |
| Medium | Medium  | High       | Moderately Struggling    |
| Medium | High    | Low        | Stressed but Stable      |
| Medium | High    | Medium     | Anxious and Concerned    |
| Medium | High    | High       | Moderately Overwhelmed   |
| High   | Low     | Medium     | Heavily Burdened         |
| High   | Low     | High       | Significantly Down       |
| High   | Medium  | Low        | Stressed but Managing    |
| High   | Medium  | Medium     | High Stress and Concern  |
| High   | Medium  | High       | Stressed and Struggling  |
| High   | High    | Low        | Stressed & Anxious       |
| High   | High    | Medium     | Highly Anxious           |
| High   | High    | High       | All Systems Overloaded   |

## API Endpoints

### 1. Get Personalized Recommendations

```
GET /api/resources/recommendations/{report_id}?limit=3
```

Returns the first 3 videos from the user's personalized playlist.

**Response for Registered Users:**

```json
{
  "success": true,
  "data": {
    "emotional_profile_key": "feeling_good",
    "emotional_profile_display": "Feeling Good",
    "playlist_id": "PLxxxxxxxxx",
    "videos": [...],
    "total_videos": 25,
    "recommendations_count": 3
  }
}
```

**Response for Trial Users (403 Forbidden):**

```json
{
  "success": false,
  "error": "trial_user_restricted",
  "message": "Resources are only available for registered users. Please complete your registration to access personalized video recommendations."
}
```

### 2. Get Full Playlist

```
GET /api/resources/playlist/{playlist_id}?max_results=100
```

Returns all videos from a specific playlist.

### 3. Get Video Details

```
GET /api/resources/video/{video_id}
```

Returns detailed information about a specific video.

### 4. Get User's Full Playlist

```
GET /api/resources/report/{report_id}/playlist
```

Returns the complete playlist associated with a user's emotional profile.

### 5. Get Emotional Profile

```
GET /api/resources/emotional-profile/{report_id}
```

Returns the user's emotional profile group and associated playlist ID.

## Error Handling

### Error Types

1. **trial_user_restricted** (403 Forbidden)

   - Occurs when trial users try to access resources
   - User must complete registration to access features

2. **validation_error** (400 Bad Request)

   - Invalid report ID or missing mental health scores
   - Malformed request data

3. **server_error** (500 Internal Server Error)
   - YouTube API errors or database issues
   - System-level problems

### HTTP Status Codes

- **200 OK**: Successful response with data
- **400 Bad Request**: Validation errors
- **403 Forbidden**: Trial user access denied
- **404 Not Found**: Video or playlist not found
- **500 Internal Server Error**: Server-side errors

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_API_QUOTA_LIMIT=10000
```

### Playlist Configuration

Update the `EMOTIONAL_PROFILE_PLAYLISTS` mapping in `backend/app/services/resources/playlist_config.py` with actual YouTube playlist IDs:

```python
EMOTIONAL_PROFILE_PLAYLISTS = {
    "feeling_good": "PLxxxxxxxxx",  # Replace with actual playlist ID
    "a_little_blue": "PLxxxxxxxxx", # Replace with actual playlist ID
    # ... etc
}
```

The playlist configuration is now separated from the main application config for better organization and maintainability.

## Dependencies

The service requires these additional packages:

```bash
pip install google-api-python-client==2.108.0
pip install google-auth-httplib2==0.1.1
pip install google-auth-oauthlib==1.1.0
```

## Testing

Run the test script to verify the implementation:

```bash
cd backend
python test_resources_service.py
```

The test suite includes:

- Emotional profile mapping validation
- Display name conversion
- Playlist ID mapping
- Trial user restriction testing

## Usage Example

```python
from app.services.resources.resources_service import ResourcesService

# Initialize service
resources_service = ResourcesService()

# Get personalized recommendations for a user
recommendations = resources_service.get_personalized_recommendations("report_id_123", limit=3)

# Check for trial user restriction
if "error" in recommendations and recommendations["error"] == "trial_user_restricted":
    print("User must complete registration to access resources")
else:
    # Process recommendations
    videos = recommendations["videos"]
```

## Security

- All endpoints require authentication via `@login_required` decorator
- Trial users are automatically blocked from accessing resources
- CORS is enabled for cross-origin requests
- YouTube API keys are stored securely in environment variables

## Performance Considerations

- Playlist data can be cached to reduce API calls
- YouTube API quota management is implemented
- Batch video information retrieval for playlists
- Error boundaries prevent service failures from cascading
- User status checking is optimized for minimal database queries
