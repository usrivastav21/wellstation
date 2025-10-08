def process_data(data=None):
    if data:
        return {"processed": data, "status": "success"}
    return {"message": "Default data", "status": "success"}