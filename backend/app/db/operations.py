from app.db.db import get_db
import datetime
from typing import Optional


# Use lazy initialization with a singleton-like pattern
def get_db_connection():
    """Get database connection singleton."""
    if not hasattr(get_db_connection, "_db"):
        get_db_connection._db = get_db()
    return get_db_connection._db


def insert_data(collection_name: str, data: dict) -> dict:
    """
    Insert a single document into the specified collection.

    Args:
        collection_name: Name of the collection
        data: Dictionary containing the data to insert

    Returns:
        Dictionary with inserted data including the generated _id and created_at timestamp
    """
    db = get_db_connection()
    collection = db[collection_name]

    # Add timestamp to the data
    data_with_timestamp = {**data, "created_at": datetime.datetime.utcnow()}

    try:
        result = collection.insert_one(data_with_timestamp)
        return {**data_with_timestamp, "_id": str(result.inserted_id)}
    except Exception as e:
        # Add proper error handling
        raise Exception(f"Failed to insert data: {str(e)}")


def find_data(
    collection_name: str,
    query: dict,
    limit: int = 100,
    projection: Optional[dict] = None,
) -> list:
    db = get_db_connection()
    collection = db[collection_name]

    try:
        # Convert cursor to list and add optimization parameters
        cursor = collection.find(query, projection)
        return list(cursor.limit(limit))
    except Exception as e:
        raise Exception(f"Failed to query data: {str(e)}")


def update_data(
    collection_name: str, query: dict, update: dict, upsert: bool = False
) -> dict:
    """
    Update documents in the specified collection matching the query.

    Args:
        collection_name: Name of the collection
        query: Dictionary containing the query parameters
        update: Dictionary containing the update operations
        upsert: If True, perform an insert if no documents match the query

    Returns:
        Dictionary with update statistics including matched_count, modified_count, and upserted_id
    """
    db = get_db_connection()
    collection = db[collection_name]

    try:
        # Add updated_at timestamp to the update operations
        if "$set" not in update:
            update["$set"] = {}
        update["$set"]["updated_at"] = datetime.datetime.utcnow()

        result = collection.update_many(query, update, upsert=upsert)
        return {
            "matched_count": result.matched_count,
            "modified_count": result.modified_count,
            "upserted_id": str(result.upserted_id) if result.upserted_id else None,
        }
    except Exception as e:
        raise Exception(f"Failed to update data: {str(e)}")
