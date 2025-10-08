from app.db.operations import find_data
from app.db.collections import COLLECTIONS

def fetch_support_data():
# Create search query based on user_id if provided
    search_query = {}
    
    # Fetch venues from database
    venues = find_data(COLLECTIONS['SUPPORT'], search_query)
    
    # Convert ObjectId to string for JSON serialization
    for venue in venues:
        if '_id' in venue:
            venue['_id'] = str(venue['_id'])
    
    return venues