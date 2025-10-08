# WellStation Backend Logging System

This document explains how to use the logging system to track application events, including email errors.

## What Gets Logged

The system now logs:

- **All application events** → `logs/wellstation.log`
- **Error-level events only** → `logs/wellstation_errors.log`
- **Console output** → Terminal/console where you run the backend

## Log Levels

- **DEBUG**: Detailed information for debugging
- **INFO**: General information about application flow
- **WARNING**: Warning messages for potential issues
- **ERROR**: Error messages (including email failures)

## Viewing Logs

### 1. Using the Log Viewer Script (Recommended)

```bash
# View last 50 lines of all logs
python view_logs.py

# View only error logs
python view_logs.py --errors-only

# View last 100 lines
python view_logs.py --lines 100

# Filter by log level
python view_logs.py --level ERROR

# Search for specific text
python view_logs.py --search "email"

# Show logs since a specific date
python view_logs.py --since "2025-01-20"

# Show logs since a specific time
python view_logs.py --since "2025-01-20 14:30"

# View all logs (no line limit)
python view_logs.py --lines 0
```

### 2. Direct File Access

```bash
# View all logs
tail -f logs/wellstation.log

# View only errors
tail -f logs/wellstation_errors.log

# Search for email errors
grep "Error sending email" logs/wellstation.log

# View last 100 lines
tail -n 100 logs/wellstation.log
```

### 3. Real-time Log Monitoring

```bash
# Watch logs in real-time
tail -f logs/wellstation.log | grep --color=always "ERROR\|WARNING\|INFO"

# Watch only email-related logs
tail -f logs/wellstation.log | grep --color=always "email\|Email"
```

## Email Error Tracking

When email sending fails, you'll see logs like:

```
2025-01-20 15:30:45,123 - app.services.email.email_service - ERROR - email_service.py:91 - Error sending email: SMTPAuthenticationError(535, b'Authentication failed')
```

## Log File Locations

- **All logs**: `backend/logs/wellstation.log`
- **Errors only**: `backend/logs/wellstation_errors.log`
- **Log directory**: `backend/logs/`

## Log Rotation

Logs automatically rotate when they reach 10MB, keeping up to 5 backup files:

- `wellstation.log` (current)
- `wellstation.log.1` (backup 1)
- `wellstation.log.2` (backup 2)
- etc.

## Troubleshooting

### No logs appearing?

1. Make sure the backend has been started at least once
2. Check if the `logs/` directory exists
3. Verify file permissions

### Logs too verbose?

- Use `--level ERROR` to see only errors
- Use `--errors-only` for the errors-only log file
- Use `--search` to filter by specific terms

### Need to clear logs?

```bash
# Clear current logs (keep rotation files)
> logs/wellstation.log
> logs/wellstation_errors.log

# Or remove all log files
rm -rf logs/*
```

## Example Usage Scenarios

### Debug Email Issues

```bash
# Watch email errors in real-time
python view_logs.py --errors-only --search "email" --lines 0

# Check recent email attempts
python view_logs.py --search "Email sent successfully" --lines 20
```

### Monitor Application Health

```bash
# Check for any errors in the last hour
python view_logs.py --since "$(date -d '1 hour ago' '+%Y-%m-%d %H:%M')" --level ERROR

# View startup logs
python view_logs.py --search "Logging system initialized" --lines 10
```
