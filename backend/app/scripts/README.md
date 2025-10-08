# Admin Account Creation Scripts

This directory contains scripts for managing admin accounts in the WellStation backend.

## Files

- `create_admin_accounts.py` - Main script to create multiple admin accounts
- `test_db_connection.py` - Test script to verify database connectivity

## Prerequisites

1. **MongoDB**: Make sure MongoDB is running
2. **Environment Variables**: Set up your `.env` file with:
   ```
   MONGO_URI=mongodb://localhost:27017/
   DATABASE_NAME=WellStation
   ```
3. **Python Dependencies**: Install required packages from `requirements.txt`

## Usage

### 1. Test Database Connection

First, test if your database connection is working:

```bash
cd app/scripts
python3 test_db_connection.py
```

### 2. Create Admin Accounts

#### Basic Usage

```bash
# Create 5 admin accounts with default settings
python3 create_admin_accounts.py 5
```

#### Advanced Usage

```bash
# Create 10 admin accounts with custom prefix
python3 create_admin_accounts.py 10 --prefix test

# Create 3 admin accounts with custom launch value
python3 create_admin_accounts.py 3 --launch "production"

# Create accounts and save details to file
python3 create_admin_accounts.py 5 --output admin_accounts.txt

# Combine all options
python3 create_admin_accounts.py 7 --prefix "dev" --launch "staging" --output dev_accounts.txt
```

## Account Format

- **Username**: `admin{prefix}{number}` (e.g., `adminadm1`, `adminadm2`)
- **Password**: 8-character secure password with mixed characters
- **Venue**: Same as username
- **Launch**: Configurable (defaults to empty string)

## Examples

### Create 3 test accounts:

```bash
python3 create_admin_accounts.py 3 --prefix test --output test_accounts.txt
```

This will create:

- `admintest1` / `K9#mN2pL`
- `admintest2` / `X7$qR4vZ`
- `admintest3` / `P5@nQ8wM`

### Create production accounts:

```bash
python3 create_admin_accounts.py 5 --prefix prod --launch "production" --output prod_accounts.txt
```

## Features

- ✅ **Duplicate Prevention**: Skips existing accounts
- ✅ **Secure Passwords**: 8 characters with mixed character types
- ✅ **Flexible Configuration**: Customizable prefix and launch values
- ✅ **File Output**: Option to save credentials
- ✅ **Error Handling**: Graceful error handling and reporting
- ✅ **Database Integration**: Uses existing database operations

## Troubleshooting

### Import Error

If you get `ModuleNotFoundError: No module named 'app'`, make sure you're running the script from the correct directory:

```bash
cd /path/to/well-station-python-backend/app/scripts
python3 create_admin_accounts.py 5
```

### Database Connection Error

If you get database connection errors:

1. Check if MongoDB is running
2. Verify your `.env` file has correct `MONGO_URI` and `DATABASE_NAME`
3. Run the test script first: `python3 test_db_connection.py`

### Permission Error

If you get permission errors, make the script executable:

```bash
chmod +x create_admin_accounts.py
```
