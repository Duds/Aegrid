# Weather Rate Limit Data Directory

This directory stores persistent rate limit data for the weather API to ensure
rate limiting is maintained across application restarts.

## Files

- `weather-rate-limits.json` - Contains rate limit entries for weather API calls
  - Format: Array of WeatherRateLimitEntry objects
  - Automatically managed by WeatherRateLimiter class
  - Cleans up expired entries on startup

## Security

- This directory should be writable by the application process
- Rate limit data contains no sensitive information (only timestamps and counts)
- Files are automatically cleaned up when entries expire

## Backup

- Rate limit data is not critical and can be safely deleted
- Application will recreate entries as needed
- Consider excluding from backups to avoid unnecessary storage
