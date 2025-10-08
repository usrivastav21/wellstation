#!/usr/bin/env python3
"""
Test script to verify database connection and basic operations.
"""

import os
import sys

# Add the parent directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.db.db import get_db
from app.db.collections import COLLECTIONS


def test_database_connection():
    """Test basic database connection."""
    print("[TEST] Testing database connection...")

    try:
        # Get database connection
        db = get_db()

        # Test basic operations
        collection = db[COLLECTIONS["ADMIN_AUTH"]]

        # Try to find one document (should not fail even if empty)
        result = collection.find_one()

        print(f"[OK] Database connection successful!")
        print(f"[INFO] Database name: {db.name}")
        print(f"[INFO] Collections: {db.list_collection_names()}")

        return True

    except Exception as e:
        print(f"[ERROR] Database connection failed: {str(e)}")
        return False


def main():
    """Main function to run database tests."""
    print("[START] Database Connection Test")
    print("=" * 40)

    success = test_database_connection()

    print("\n" + "=" * 40)
    if success:
        print("[SUCCESS] Database connection test passed!")
        return 0
    else:
        print("[ERROR] Database connection test failed!")
        return 1


if __name__ == "__main__":
    sys.exit(main())
