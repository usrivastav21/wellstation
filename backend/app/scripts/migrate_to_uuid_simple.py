#!/usr/bin/env python3
"""
Simple migration script to add UUID fields to existing users in the user_auth collection.
This script works independently of Flask and directly connects to MongoDB.
"""

import uuid
import sys
from datetime import datetime
from pymongo import MongoClient


def get_mongodb_connection():
    """Get MongoDB connection directly"""
    try:
        # You can modify these connection details as needed
        # For local development, this should work
        client = MongoClient(
            "mongodb+srv://wellstation:2LLDwM6SuSuKTVlv@cluster0.3sinvmf.mongodb.net/"
        )
        db = client["WellStationDev"]  # Using database name from your config
        return db
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        return None


def get_users_from_db(db):
    """Get all users from user_auth collection"""
    try:
        collection = db["user_auth"]  # Using collection name from your config
        users = list(collection.find({}))
        return users
    except Exception as e:
        print(f"Failed to get users: {e}")
        return None


def update_user_with_uuid(db, user_id, uuid_value):
    """Update a user document with UUID"""
    try:
        collection = db["user_auth"]  # Using collection name from your config
        result = collection.update_one(
            {"_id": user_id}, {"$set": {"user_id": uuid_value}}
        )
        return result.modified_count > 0
    except Exception as e:
        print(f"Failed to update user {user_id}: {e}")
        return False


def migrate_users_to_uuid():
    """Add UUID field to all existing users"""
    print("Starting UUID migration for existing users...")

    # Connect to MongoDB
    db = get_mongodb_connection()
    if db is None:
        print("Failed to connect to MongoDB. Please check your connection settings.")
        return

    try:
        # Get all existing users
        users = get_users_from_db(db)

        if not users:
            print("No users found in user_auth collection.")
            return

        print(f"Found {len(users)} users to migrate...")

        migrated_count = 0
        skipped_count = 0

        for user in users:
            user_id = user.get("_id")
            existing_uuid = user.get("user_id")

            if existing_uuid:
                print(f"User {user_id} already has UUID: {existing_uuid}")
                skipped_count += 1
                continue

            # Generate new UUID
            new_uuid = str(uuid.uuid4())

            try:
                # Update user document with UUID
                success = update_user_with_uuid(db, user_id, new_uuid)

                if success:
                    print(f"✓ Migrated user {user_id} to UUID: {new_uuid}")
                    migrated_count += 1
                else:
                    print(f"✗ Failed to migrate user {user_id}")

            except Exception as e:
                print(f"✗ Error migrating user {user_id}: {str(e)}")

        print(f"\nMigration completed!")
        print(f"Successfully migrated: {migrated_count} users")
        print(f"Skipped (already had UUID): {skipped_count} users")

        # Verify migration
        verify_migration(db)

    except Exception as e:
        print(f"Migration failed: {str(e)}")
        sys.exit(1)


def verify_migration(db):
    """Verify that all users now have UUIDs"""
    print("\nVerifying migration...")

    try:
        users = get_users_from_db(db)
        if not users:
            print("No users found for verification")
            return

        users_without_uuid = [user for user in users if "user_id" not in user]

        if not users_without_uuid:
            print("✓ All users have UUID fields")
        else:
            print(f"✗ {len(users_without_uuid)} users still missing UUID fields")
            for user in users_without_uuid:
                print(
                    f"  - User ID: {user.get('_id')}, Email: {user.get('email', 'N/A')}"
                )

    except Exception as e:
        print(f"Verification failed: {str(e)}")


def check_collection_status(db):
    """Check the current status of the user_auth collection"""
    print("Checking user_auth collection status...")

    try:
        users = get_users_from_db(db)
        if not users:
            print("No users found in collection")
            return

        users_with_uuid = [user for user in users if "user_id" in user]
        users_without_uuid = [user for user in users if "user_id" not in user]

        print(f"Total users: {len(users)}")
        print(f"Users with UUID: {len(users_with_uuid)}")
        print(f"Users without UUID: {len(users_without_uuid)}")

        if users_without_uuid:
            print("\nUsers still needing UUID:")
            for user in users_without_uuid[:5]:  # Show first 5
                print(f"  - ID: {user.get('_id')}, Email: {user.get('email', 'N/A')}")
            if len(users_without_uuid) > 5:
                print(f"  ... and {len(users_without_uuid) - 5} more")

    except Exception as e:
        print(f"Status check failed: {str(e)}")


def main():
    """Main migration function"""
    print("=" * 60)
    print("Simple UUID Migration Script for WellStation User Auth")
    print("=" * 60)
    print(f"Timestamp: {datetime.now()}")
    print()

    # Connect to MongoDB first
    db = get_mongodb_connection()
    if db is None:
        print("Cannot proceed without database connection.")
        return

    # Check current status
    check_collection_status(db)
    print()

    # Ask for confirmation
    response = (
        input("Do you want to proceed with the migration? (y/N): ").strip().lower()
    )

    if response not in ["y", "yes"]:
        print("Migration cancelled.")
        return

    print()

    # Perform migration
    migrate_users_to_uuid()

    print("\n" + "=" * 60)
    print("Migration script completed!")
    print("=" * 60)


if __name__ == "__main__":
    main()
