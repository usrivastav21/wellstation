import os
import sys
import json
from pathlib import Path

from dotenv import load_dotenv
from datetime import timedelta


def load_build_info():
    """Load build information from bundled build_info.json"""
    try:
        # Check if this is during PyInstaller build process
        if os.getenv("PYINSTALLER_BUILD") == "1" or (
            os.getenv("PYTHONPATH") and "PyInstaller" in os.getenv("PYTHONPATH")
        ):
            print("Build process detected - using development fallback")
            return {"build_type": "dev", "environment": "development"}

        # Detect if running from PyInstaller bundle
        if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
            # Running from PyInstaller bundle
            build_info_path = Path(sys._MEIPASS) / "build_info.json"
        else:
            # Running in development
            build_info_path = Path(__file__).parent / "build_info.json"

        if build_info_path.exists():
            with open(build_info_path, "r") as f:
                build_info = json.load(f)
            return build_info
        else:
            # Fallback for development without build_info.json
            return {"build_type": "dev", "environment": "development"}
    except Exception as e:
        print(f"Warning: Could not load build info: {e}")
        # Fallback to development
        return {"build_type": "dev", "environment": "development"}


# Detect if running from PyInstaller bundle
is_pyinstaller_bundle = getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS")

if is_pyinstaller_bundle:
    # Load build info to determine environment
    build_info = load_build_info()
    env = build_info.get("environment", "development")
    build_type = build_info.get("build_type", "dev")

    # Set FLASK_ENV for other parts of the app
    os.environ["FLASK_ENV"] = env

    print(f"Loading environment file: .env (from {env} build)")
    # TODO: Add validation to ensure bundled .env file exists
    load_dotenv(override=True)  # Load the bundled .env file
else:
    # Development mode - use FLASK_ENV or default to development
    env = os.getenv("FLASK_ENV", "development")
    env_file = f".env.{env}"

    # Try to load environment-specific file first, fallback to .env
    if os.path.exists(env_file):
        print(f"Loading environment file: {env_file}")
        load_dotenv(env_file, override=True)
    else:
        print(f"Environment file {env_file} not found, loading default .env")
        load_dotenv(override=True)


class Config:
    """Base configuration class"""

    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    DATABASE_NAME = os.getenv("DATABASE_NAME", "WellStation")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "secret-key")
    JWT_ALGORITHM = "HS256"

    # YouTube API Configuration
    YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")
    YOUTUBE_API_QUOTA_LIMIT = int(os.getenv("YOUTUBE_API_QUOTA_LIMIT", "10000"))


class DevelopmentConfig(Config):
    """Development configuration"""

    DEBUG = True
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    DATABASE_NAME = os.getenv("DATABASE_NAME", "WellStationDev")
    JWT_EXP_DELTA_ADMIN = timedelta(days=365 * 100)
    JWT_EXP_DELTA_USER = timedelta(hours=3)
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-key")
    JWT_ALGORITHM = "HS256"


class ProductionConfig(Config):
    """Production configuration"""

    DEBUG = False
    MONGO_URI = os.getenv("MONGO_URI")  # Must be set in production
    DATABASE_NAME = os.getenv("DATABASE_NAME", "WellStation")
    JWT_EXP_DELTA_ADMIN = timedelta(days=365 * 100)  # practically never expires
    JWT_EXP_DELTA_USER = timedelta(minutes=20)
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")  # Must be set in production
    JWT_ALGORITHM = "HS256"


# Configuration mapping
config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}
