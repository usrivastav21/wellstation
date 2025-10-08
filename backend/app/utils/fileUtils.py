import shutil
import os

def delete_directory(path: str) -> bool:
    try:
        if os.path.exists(path):
            shutil.rmtree(path)
            return True
        return False
    except Exception as e:
        print(f"Error deleting directory {path}: {e}")
        return False
