from app.db.operations import find_data, insert_data, update_data
from app.db.collections import COLLECTIONS


def add_booth_location(data):
    # Insert the data into the venues collection
    saved_res = insert_data(COLLECTIONS["VENUES"], data)

    # Convert ObjectId to string for JSON serialization
    if saved_res and "_id" in saved_res:
        saved_res["_id"] = str(saved_res["_id"])

    return saved_res


def update_booth_location(data):
    # Extract the ID from the data to identify which record to update
    if "_id" not in data:
        raise ValueError("ID is required to update booth location")

    record_id = data["_id"]
    # Remove _id from update data to avoid conflicts
    update_data_copy = {k: v for k, v in data.items() if k != "_id"}

    # Update the record in the venues collection
    search_query = {"_id": record_id}
    update_operations = {"$set": update_data_copy}

    saved_res = update_data(COLLECTIONS["VENUES"], search_query, update_operations)

    return saved_res


def fetch_booth_locations():
    # Create search query based on user_id if provided
    search_query = {}

    # Fetch venues from database
    venues = find_data(COLLECTIONS["VENUES"], search_query)

    # Convert ObjectId to string for JSON serialization
    for venue in venues:
        if "_id" in venue:
            venue["_id"] = str(venue["_id"])

    return venues
