from pymongo import MongoClient
from flask import current_app


def get_db():
    """Get database connection using Flask app configuration"""
    if not hasattr(get_db, "_client"):
        get_db._client = MongoClient(
            current_app.config["MONGO_URI"],
            tls=True,
            tlsAllowInvalidCertificates=True,  # Bypasses SSL certificate verification
            tlsAllowInvalidHostnames=True,  # Allows invalid hostnames
            serverSelectionTimeoutMS=30000,  # 30 second timeout
            connectTimeoutMS=20000,  # 20 second connection timeout
        )
        get_db._db = get_db._client[current_app.config["DATABASE_NAME"]]
    return get_db._db
