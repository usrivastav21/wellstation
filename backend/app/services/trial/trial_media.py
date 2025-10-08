import os
from typing import Dict, Any

from app.utils.fileUtils import delete_directory
from app.services.trial.trial_service import trial_service


def getTrialReport(trial_id: str) -> Dict[str, Any]:
    """
    Get the complete trial report after both video and audio processing

    Args:
        trial_id: Trial session identifier

    Returns:
        Complete trial report
    """
    try:
        return trial_service.get_trial_report(trial_id)
    except Exception as e:
        raise Exception(f"Failed to get trial report: {str(e)}")


def cleanupTrialFiles(trial_id: str) -> bool:
    """
    Clean up all files associated with a trial session

    Args:
        trial_id: Trial session identifier

    Returns:
        True if cleanup successful, False otherwise
    """
    try:
        # Clean up media files
        media_dir = os.path.join(os.getcwd(), "media", f"trial_{trial_id}")
        if os.path.exists(media_dir):
            delete_directory(media_dir)

        # Clean up processing files
        processing_dirs = [
            os.path.join(
                os.getcwd(), "processingScripts", "features", f"trial_{trial_id}"
            ),
            os.path.join(
                os.getcwd(), "processingScripts", "model_outputs", f"trial_{trial_id}"
            ),
            os.path.join(
                os.getcwd(), "processingScripts", "final_outputs", f"trial_{trial_id}"
            ),
        ]

        for directory in processing_dirs:
            if os.path.exists(directory):
                delete_directory(directory)

        return True

    except Exception as e:
        print(f"Error cleaning up trial files: {str(e)}")
        return False
