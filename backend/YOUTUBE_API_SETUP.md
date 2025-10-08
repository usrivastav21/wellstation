# YouTube API Setup Guide

## Prerequisites

1. Google Cloud Platform account
2. YouTube Data API v3 enabled
3. API key with appropriate quotas

## Setup Steps

### 1. Enable YouTube Data API v3

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to "APIs & Services" > "Library"
4. Search for "YouTube Data API v3"
5. Click "Enable"

### 2. Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Optional) Restrict the key to YouTube Data API v3 only

### 3. Configure Environment Variables

Add these to your `.env` file:

```bash
YOUTUBE_API_KEY=your_actual_api_key_here
YOUTUBE_API_QUOTA_LIMIT=10000
```

### 4. Update Playlist IDs

In `config.py`, replace the placeholder playlist IDs with actual YouTube playlist IDs:

```python
EMOTIONAL_PROFILE_PLAYLISTS = {
    "feeling_good": "PLxxxxxxxxx",  # Replace with actual playlist ID
    "a_little_blue": "PLxxxxxxxxx", # Replace with actual playlist ID
    # ... etc
}
```

### 5. Install Dependencies

```bash
pip install google-api-python-client==2.108.0
pip install google-auth-httplib2==0.1.1
pip install google-auth-oauthlib==1.1.0
```

## API Quotas

YouTube Data API v3 has daily quotas:

- Default: 10,000 units per day
- Each API call costs units:
  - `playlistItems.list`: 1 unit
  - `videos.list`: 1 unit

## Testing

Run the test script to verify setup:

```bash
cd backend
python test_resources_service.py
```

## Troubleshooting

### Common Issues

1. **API Key Invalid**: Check if the key is correct and API is enabled
2. **Quota Exceeded**: Monitor usage in Google Cloud Console
3. **Playlist Not Found**: Verify playlist IDs are correct and public
4. **Authentication Error**: Ensure API key has proper permissions

### Error Messages

- `YouTube API key not configured`: Set `YOUTUBE_API_KEY` in environment
- `YouTube API error`: Check API key validity and quotas
- `No playlist found`: Verify playlist ID mapping in config
