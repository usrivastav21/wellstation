#!/usr/bin/env python3
import os
import sys
import subprocess


def start_dev(port=None):
    """Start server in development mode"""
    # Check if Electron is shutting down
    if os.getenv("ELECTRON_SHUTDOWN") == "1":
        print("Skipping Flask server start - Electron is shutting down")
        return

    print("🚀 Starting server in DEVELOPMENT mode...")
    print("📁 Loading .env.development file...")

    os.environ["FLASK_ENV"] = "development"
    # Pass port to run.py if provided
    if port:
        subprocess.run([sys.executable, "run.py", str(port)])
    else:
        subprocess.run([sys.executable, "run.py"])


def start_prod(port=None):
    """Start server in production mode"""
    # Check if Electron is shutting down
    if os.getenv("ELECTRON_SHUTDOWN") == "1":
        print("Skipping Flask server start - Electron is shutting down")
        return

    print("🚀 Starting server in PRODUCTION mode...")
    print("📁 Loading .env.production file...")

    os.environ["FLASK_ENV"] = "production"

    # Pass port to run.py if provided
    if port:
        subprocess.run([sys.executable, "run.py", str(port)])
    else:
        subprocess.run([sys.executable, "run.py"])


def show_help():
    """Show available commands"""
    print(
        """
🛠️  Available commands:
  python3 manage.py dev     - Start in development mode (.env.development)
  python3 manage.py prod    - Start in production mode (.env.production)
  python3 manage.py help    - Show this help message

📁 Environment files:
  .env.development - Development configuration
  .env.production  - Production configuration
  .env            - Fallback configuration

  Port configuration:
  If no port is specified, the server will use the default port (5000)
  Port can also be set via the PORT environment variable
    """
    )


if __name__ == "__main__":
    if len(sys.argv) < 2:
        show_help()
        sys.exit(1)

    command = sys.argv[1].lower()
    port = None

    # Check if port is provided as third argument
    if len(sys.argv) > 2:
        try:
            port = int(sys.argv[2])
        except ValueError:
            print(f"[ERROR] Invalid port number: {sys.argv[2]}")
            sys.exit(1)

    if command == "dev":
        start_dev(port)
    elif command == "prod":
        start_prod(port)
    elif command == "help":
        show_help()
    else:
        print(f"❌ Unknown command: {command}")
        show_help()
        sys.exit(1)
