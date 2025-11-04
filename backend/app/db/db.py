from pymongo import MongoClient
from flask import current_app


def get_db():
    """Get database connection using Flask app configuration"""
    if not hasattr(get_db, "_client"):
        mongo_uri = current_app.config["MONGO_URI"]
        
        # For mongodb+srv:// connections, TLS is automatically handled
        # Only set TLS options for mongodb:// connections if needed
        if mongo_uri.startswith("mongodb+srv://"):
            # MongoDB Atlas connection - TLS is implicit
            get_db._client = MongoClient(
                mongo_uri,
                serverSelectionTimeoutMS=30000,  # 30 second timeout
                connectTimeoutMS=20000,  # 20 second connection timeout
            )
        else:
            # Regular mongodb:// connection - TLS only if explicitly configured
            # For local MongoDB, typically no TLS needed
            get_db._client = MongoClient(
                mongo_uri,
                serverSelectionTimeoutMS=30000,  # 30 second timeout
                connectTimeoutMS=20000,  # 20 second connection timeout
            )
        get_db._db = get_db._client[current_app.config["DATABASE_NAME"]]
    return get_db._db
