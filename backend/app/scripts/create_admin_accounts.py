#!/usr/bin/env python3
"""
Script to create multiple admin accounts in the ADMIN_AUTH collection.
Generates accounts with user_name starting with 'admin' and secure passwords.
"""

import argparse
import random
import string
import sys
import os

# Add the parent directory to the Python path to allow imports
sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)

from werkzeug.security import generate_password_hash
from app.db.collections import COLLECTIONS
from app.db.operations import find_data, insert_data


def generate_secure_password(length=8):
    """
    Generate a secure password with specified length.
    Includes uppercase, lowercase, digits, and special characters.
    """
    if length < 8:
        length = 8

    # Define character sets
    lowercase = string.ascii_lowercase
    uppercase = string.ascii_uppercase
    digits = string.digits
    special_chars = "!@#$%^&*"

    # Ensure at least one character from each set
    password = [
        random.choice(lowercase),
        random.choice(uppercase),
        random.choice(digits),
        random.choice(special_chars),
    ]

    # Fill the rest with random characters from all sets
    all_chars = lowercase + uppercase + digits + special_chars
    for _ in range(length - 4):
        password.append(random.choice(all_chars))

    # Shuffle the password
    random.shuffle(password)
    return "".join(password)


def generate_admin_accounts(count, prefix="adm", launch=""):
    """
    Generate multiple admin accounts.

    Args:
        count: Number of admin accounts to create
        prefix: Prefix for user_name (default: "adm")
        launch: Launch field value (default: empty string)

    Returns:
        List of created admin documents
    """
    created_accounts = []

    for i in range(1, count + 1):
        # Generate user_name: admin + prefix + number (e.g., adminadm1, adminadm2)
        user_name = f"admin{prefix}{i}"

        # Generate secure password
        password = generate_secure_password()

        # Create admin document
        admin_doc = {
            "user_name": user_name,
            "password": generate_password_hash(password, method="pbkdf2:sha256"),
            "venue": user_name,  # venue gets the user_name value
            "launch": launch,
        }

        # Check if admin already exists
        existing_admin = find_data(
            COLLECTIONS["ADMIN_AUTH"], {"user_name": user_name}, limit=1
        )

        if existing_admin:
            print(f"⚠️  Admin '{user_name}' already exists. Skipping...")
            continue

        try:
            # Insert the admin account
            insert_data(COLLECTIONS["ADMIN_AUTH"], admin_doc)
            created_accounts.append(
                {
                    "user_name": user_name,
                    "password": password,  # Store plain password for display
                    "venue": user_name,
                    "launch": launch,
                }
            )
            print(f"✅ Created admin account: {user_name}")
        except Exception as e:
            print(f"❌ Failed to create admin '{user_name}': {str(e)}")

    return created_accounts


def main():
    parser = argparse.ArgumentParser(description="Create multiple admin accounts")
    parser.add_argument("count", type=int, help="Number of admin accounts to create")
    parser.add_argument(
        "--prefix", default="adm", help="Prefix for user_name (default: 'adm')"
    )
    parser.add_argument(
        "--launch", default="", help="Launch field value (default: empty string)"
    )
    parser.add_argument(
        "--output", help="Output file to save account details (optional)"
    )

    args = parser.parse_args()

    if args.count <= 0:
        print("❌ Count must be a positive integer")
        return

    print(f"🚀 Creating {args.count} admin accounts...")
    print(f"📝 Prefix: {args.prefix}")
    print(f"🚀 Launch value: '{args.launch}'")
    print("-" * 50)

    # Generate admin accounts
    created_accounts = generate_admin_accounts(args.count, args.prefix, args.launch)

    print("-" * 50)
    print(f"✅ Successfully created {len(created_accounts)} admin accounts")

    # Display created accounts
    if created_accounts:
        print("\n📋 Created Admin Accounts:")
        print("-" * 50)
        for i, account in enumerate(created_accounts, 1):
            print(f"{i}. Username: {account['user_name']}")
            print(f"   Password: {account['password']}")
            print(f"   Venue: {account['venue']}")
            print(f"   Launch: '{account['launch']}'")
            print()

        # Save to file if requested
        if args.output:
            try:
                with open(args.output, "w") as f:
                    f.write("Admin Account Details\n")
                    f.write("=" * 50 + "\n\n")
                    for i, account in enumerate(created_accounts, 1):
                        f.write(f"{i}. Username: {account['user_name']}\n")
                        f.write(f"   Password: {account['password']}\n")
                        f.write(f"   Venue: {account['venue']}\n")
                        f.write(f"   Launch: '{account['launch']}'\n\n")
                print(f"💾 Account details saved to: {args.output}")
            except Exception as e:
                print(f"❌ Failed to save to file: {str(e)}")

    print("🎉 Admin account creation completed!")


if __name__ == "__main__":
    main()
