# Trial Service Documentation

This service provides "try first" functionality for anonymous users to experience the product before registering.

## Overview

The trial service allows users to:

1. Start a trial session without authentication
2. Process video and audio files
3. Generate health reports
4. Link their trial data to a permanent account when they register

## Architecture

### Database Collections

- **TRIAL_REPORTS**: Stores trial session data and processing results
- **USERS**: Main user reports (trial data gets copied here upon registration)
- **ANALYSIS_DATA**: Stores analytics data for both regular and trial users

### Processing Approach

- **Reused Processing Pipeline**: Instead of duplicating processing logic, the existing `videoProcessingStart` and `audioProcessingStart` methods have been enhanced to support both regular users and trial users
- **Conditional Logic**: These methods now accept an `is_trial` parameter that determines:
  - Directory structure (trial-specific vs user-specific)
  - Database storage location (TRIAL_REPORTS vs USERS)
  - Return format (raw data vs stored document)
- **Trial Service Integration**: The trial service handles storing and updating trial data, while the processing methods focus on the actual video/audio analysis

### File Structure

```
media/
├── trial_{trial_id}/          # Trial-specific media storage
│   ├── video/
│   └── audio/
├── {user_id}/                 # Regular user media storage
│   ├── video/
│   └── audio/
processingScripts/
├── features/
│   ├── trial_{trial_id}/      # Trial-specific features
│   └── {user_id}/             # Regular user features
├── model_outputs/
│   ├── trial_{trial_id}/      # Trial-specific model outputs
│   └── {user_id}/             # Regular user model outputs
└── final_outputs/
    ├── trial_{trial_id}/      # Trial-specific final outputs
    └── {user_id}/             # Regular user final outputs
```

## API Endpoints

### 1. Start Trial Session

```http
POST /api/trial/start
```

**Response:**

```json
{
  "status": "success",
  "message": "Trial session started successfully",
  "data": {
    "trial_id": "trial_abc123xyz",
    "expires_at": "2025-02-03T10:30:00Z",
    "status": "active"
  }
}
```

### 2. Process Trial Video

```http
POST /api/trial/video
Content-Type: multipart/form-data

trial_id: trial_abc123xyz
videoFile: [video file]
venue: Gym
language: English
ageRange: 25-35
gender: male
email: user@example.com
```

**Response:**

```json
{
  "status": "success",
  "message": "Trial video processed successfully",
  "data": {
    "success": true,
    "trial_id": "trial_abc123xyz",
    "vital_signs": {...},
    "message": "Video processing completed successfully for trial user"
  }
}
```

### 3. Process Trial Audio

```http
POST /api/trial/audio
Content-Type: multipart/form-data

trial_id: trial_abc123xyz
audioFile: [audio file]
```

**Response:**

```json
{
  "status": "success",
  "message": "Trial audio processed successfully",
  "data": {
    "success": true,
    "trial_id": "trial_abc123xyz",
    "mental_health_scores": {...},
    "message": "Audio processing completed successfully for trial user"
  }
}
```

### 4. Get Trial Report

```http
GET /api/trial/report/{trial_id}
```

**Response:**

```json
{
  "status": "success",
  "message": "Trial report retrieved successfully",
  "data": {
    "trial_id": "trial_abc123xyz",
    "timestamp": "2025-01-27T10:30:00Z",
    "venue": "Gym",
    "language": "English",
    "ageRange": "25-35",
    "gender": "male",
    "vital_signs": {...},
    "mental_health_scores": {...},
    "status": "ready_for_registration"
  }
}
```

### 5. Link Trial to User (During Registration)

```http
POST /api/register
Content-Type: application/json

{
  "email": "user@example.com",
  "gender": "male",
  "pin": "123456",
  "confirm_pin": "123456",
  "birth_month_year": "1990-05",
  "role": "user",
  "trial_id": "trial_abc123xyz"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "token": "jwt_token_here",
    "user": {...},
    "trial_linking": {
      "success": true,
      "message": "Trial report successfully linked to user account",
      "user_report_id": "report_id_here",
      "trial_id": "trial_abc123xyz"
    }
  }
}
```

### 6. Admin Endpoints

#### Cleanup Expired Trials

```http
POST /api/trial/cleanup
Authorization: Bearer {admin_token}
```

#### Get Trial Statistics

```http
GET /api/trial/statistics
Authorization: Bearer {admin_token}
```

## Data Flow

### 1. Trial Session Creation

```
User clicks "Try First"
    ↓
POST /api/trial/start
    ↓
Generate trial_id
    ↓
Create record in TRIAL_REPORTS collection
    ↓
Return trial_id to frontend
```

### 2. Video Processing

```
Frontend uploads video with trial_id
    ↓
POST /api/trial/video
    ↓
Validate trial session
    ↓
Process video using existing pipeline
    ↓
Store results in TRIAL_REPORTS
    ↓
Update processing_stage to "video_processed"
```

### 3. Audio Processing

```
Frontend uploads audio with trial_id
    ↓
POST /api/trial/audio
    ↓
Validate trial session
    ↓
Process audio using existing pipeline
    ↓
Store results in TRIAL_REPORTS
    ↓
Update processing_stage to "audio_processed"
```

### 4. Report Generation

```
Frontend requests report
    ↓
GET /api/trial/report/{trial_id}
    ↓
Check if both video and audio are processed
    ↓
Return complete health report
    ↓
Frontend displays report with "Sign up to save" option
```

### 5. User Registration & Linking

```
User decides to register
    ↓
POST /api/register with trial_id
    ↓
Create permanent user account
    ↓
Copy trial data from TRIAL_REPORTS to USERS
    ↓
Mark trial as "completed" and link to user
    ↓
Return success with trial linking info
```

## Security Features

### Rate Limiting

- Maximum 5 trial attempts per IP address per day
- Configurable via `max_trials_per_ip_per_day` in TrialService

### Session Expiration

- Trial sessions expire after 7 days (configurable)
- Automatic cleanup of expired sessions and files

### Data Isolation

- Trial users cannot access other users' data
- Trial data is completely separate until registration
- No authentication bypass for sensitive operations

## Configuration

### Trial Service Settings

```python
class TrialService:
    def __init__(self):
        self.trial_expiry_days = 7                    # Days until trial expires
        self.max_trials_per_ip_per_day = 5           # Rate limiting
```

### Environment Variables

- No additional environment variables required
- Uses existing database connections and configurations

## Error Handling

### Common Error Scenarios

1. **Invalid trial_id**: 400 Bad Request
2. **Expired trial session**: 400 Bad Request
3. **Rate limit exceeded**: 400 Bad Request
4. **Processing failures**: 500 Internal Server Error
5. **Missing files**: 400 Bad Request

### Error Response Format

```json
{
  "status": "error",
  "message": "Detailed error description"
}
```

## Testing

### Run Test Script

```bash
cd backend
python test_trial_service.py
```

### Manual Testing

1. Start trial session
2. Upload test video/audio files
3. Verify report generation
4. Test registration with trial linking
5. Verify data migration

## Monitoring & Maintenance

### Automatic Cleanup

- Expired trials are automatically marked as expired
- Associated files are cleaned up
- Database records are updated

### Manual Cleanup

- Admin can trigger cleanup via `/api/trial/cleanup`
- Useful for immediate cleanup or testing

### Statistics

- Track total trials, conversions, and success rates
- Monitor system usage and performance
- Identify potential issues or abuse

## Integration Notes

### Frontend Integration

- Store `trial_id` in local storage or state
- Include `trial_id` in all trial API calls
- Handle trial linking during registration flow
- Provide clear messaging about trial limitations

### Existing System Compatibility

- No changes to existing user workflows
- Existing processing pipelines are reused
- Database schema remains backward compatible
- Authentication system unchanged

## Troubleshooting

### Common Issues

1. **Trial session not found**: Check if trial_id is correct and not expired
2. **Processing failures**: Verify file formats and sizes
3. **Rate limiting**: Wait 24 hours or use different IP
4. **Linking failures**: Ensure trial is complete and email matches

### Debug Information

- Check trial session status in database
- Verify processing stage progression
- Review error logs for specific failure reasons
- Test with minimal data to isolate issues

## Future Enhancements

### Potential Improvements

1. **Device fingerprinting**: Enhanced abuse prevention
2. **Geolocation tracking**: Regional trial limits
3. **Social sharing**: Viral trial invitations
4. **A/B testing**: Different trial experiences
5. **Analytics dashboard**: Detailed trial insights
6. **Automated conversion**: Smart follow-up emails

### Scalability Considerations

- Database indexing on trial_id and timestamps
- File storage optimization for trial media
- Background job processing for cleanup tasks
- Caching for frequently accessed trial data
