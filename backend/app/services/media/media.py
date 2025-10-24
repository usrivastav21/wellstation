import os
from copy import deepcopy

from processingScripts.feature_engineering.extract_video_features import (
    extract_video_features,
)
from processingScripts.feature_engineering.extract_audio_features import (
    extract_audio_features,
)
from processingScripts.run_model import run_hr_model, run_bp_model, run_spo2_model
from processingScripts.run_mental_health_models import (
    run_stress_model,
    run_anxiety_model,
    run_depression_model,
)
from processingScripts.get_vital_signs import get_vital_signs
from processingScripts.get_mental_health_scores import get_mental_health_scores

from app.db.operations import insert_data, find_data, update_data
from app.db.collections import COLLECTIONS
from app.utils.fileUtils import delete_directory


def create_directory_with_permissions(path, mode=0o775):
    """Create directory with proper permissions"""
    if not os.path.exists(path):
        os.makedirs(path, mode=mode, exist_ok=True)
        # Explicitly set permissions in case umask interfered
        os.chmod(path, mode)
    return path


def videoProcessingStart(file, metaData, is_trial=False):
    """
    Process video for both regular users and trial users

    Args:
        file: Uploaded video file
        metaData: Dictionary containing user data or trial data
        is_trial: Boolean indicating if this is a trial user
    """
    # Handle both regular users and trial users
    if is_trial:
        identifier = metaData["trial_id"]  # Use trial_id for trials
        directory_prefix = f"trial_{identifier}"
    else:
        identifier = metaData["userId"]  # Use userId for regular users
        directory_prefix = identifier

    # Create a directory named 'media' in the root folder if it doesn't exist
    media_dir = os.path.join(os.getcwd(), "media")
    create_directory_with_permissions(media_dir)
    print("media_dir", media_dir)

    venue = metaData.get("venue")
    language = metaData.get("language")
    ageRange = metaData.get("ageRange")
    gender = metaData.get("gender")
    email = metaData.get("email")

    # Create a user-specific or trial-specific subdirectory within 'media'
    user_media_dir = os.path.join(media_dir, directory_prefix)
    create_directory_with_permissions(user_media_dir)

    # Create a path for the video file within the user's directory
    video_path = os.path.join(user_media_dir, file.filename)

    try:
        # Save the uploaded file
        file.save(video_path)

        # Output directory for processed features in root/processingScripts/features
        features_output_dir = os.path.join(
            os.getcwd(), "processingScripts", "features", directory_prefix, "video"
        )
        create_directory_with_permissions(features_output_dir)
        print("user_features_dir", features_output_dir)

        # Call extract_video_features with the corrected output directory
        features_paths = extract_video_features(video_path, features_output_dir)

        # Output directory for model outputs
        model_output_dir = os.path.join(
            os.getcwd(), "processingScripts", "model_outputs", "hr", directory_prefix
        )
        create_directory_with_permissions(model_output_dir)

        # run the hr model
        pred_file_list = run_hr_model(
            features_output_dir, features_paths, model_output_dir
        )

        # run the bp model
        bp_sys, bp_dia = run_bp_model(
            features_output_dir, features_paths, model_output_dir
        )

        # run the spo2 model
        spo2 = run_spo2_model(features_output_dir, features_paths, model_output_dir)

        # vital signs final output directory
        final_output_directory = os.path.join(
            os.getcwd(), "processingScripts", "final_outputs", directory_prefix
        )
        create_directory_with_permissions(final_output_directory)

        vital_signs = get_vital_signs(
            pred_file_list, final_output_directory, bp_sys, bp_dia, spo2
        )

        print(vital_signs)
        response = {}

        if is_trial:
            response["trial_id"] = identifier
            response["venue"] = venue
            response["language"] = language
            response["ageRange"] = ageRange
            response["gender"] = gender
            response["vital_signs"] = deepcopy(vital_signs)
            response["email"] = email
            # Don't store directly - let trial service handle it
            return response
        else:
            response["user_Id"] = identifier
            response["venue"] = venue
            response["language"] = language
            response["ageRange"] = ageRange
            response["gender"] = gender
            response["vital_signs"] = deepcopy(vital_signs)
            response["email"] = email

            saved_res = insert_data(COLLECTIONS["USERS"], response)
            return saved_res

    except Exception as e:
        # Clean up on error
        if os.path.exists(video_path):
            os.remove(video_path)
        raise Exception(f"Video processing error: {str(e)}")


def audioProcessingStart(file, identifier, is_trial=False):
    """
    Process audio for both regular users and trial users

    Args:
        file: Uploaded audio file
        identifier: userId (for regular users) or trial_id (for trial users)
        is_trial: Boolean indicating if this is a trial user
    """
    print(
        f"Starting audio processing for {'trial' if is_trial else 'user'}: {identifier}"
    )

    # Create a directory named 'media' in the root folder if it doesn't exist
    media_dir = os.path.join(os.getcwd(), "media")
    create_directory_with_permissions(media_dir)

    # Create a user-specific or trial-specific subdirectory within 'media'
    directory_prefix = f"trial_{identifier}" if is_trial else identifier
    user_media_dir = os.path.join(media_dir, directory_prefix)
    create_directory_with_permissions(user_media_dir)

    # Create a path for the audio file within the user's directory
    audio_path = os.path.join(user_media_dir, file.filename)

    try:
        print(f"Saving audio file: {file.filename}")
        # Save the uploaded file
        file.save(audio_path)

        # Output directory for processed features in root/processingScripts/features
        features_output_dir = os.path.join(
            os.getcwd(), "processingScripts", "features", directory_prefix, "audio"
        )
        create_directory_with_permissions(features_output_dir)
        print(f"Creating features output directory: {features_output_dir}")

        print("Extracting audio features...")
        feature_filename = extract_audio_features(audio_path, features_output_dir)
        print(f"Audio features extracted to: {feature_filename}")

        print("Running mental health models...")
        stress_severity, stress_entropy, stress_entropy_percent = run_stress_model(
            features_output_dir, feature_filename
        )
        anxiety_severity, anxiety_entropy, anxiety_entropy_percent = run_anxiety_model(
            features_output_dir, feature_filename
        )
        depression_severity, depression_entropy, depression_entropy_percent = (
            run_depression_model(features_output_dir, feature_filename)
        )
        print(
            f"Model results - Stress: {stress_severity}, Anxiety: {anxiety_severity}, Depression: {depression_severity}"
        )

        print(f"Creating final output directory")
        final_output_directory = os.path.join(
            os.getcwd(), "processingScripts", "final_outputs", directory_prefix
        )
        create_directory_with_permissions(final_output_directory)
        print(f"Created final output directory: {final_output_directory}")

        print("Calculating mental health scores...")
        mental_health_scores = get_mental_health_scores(
            final_output_directory,
            stress_severity,
            anxiety_severity,
            depression_severity,
            fallback_logic=False,
        )
        print(f"Mental health scores calculated: {mental_health_scores}")

        print("Updating user data in database...")
        response = {}

        if is_trial:
            # For trials, return the mental health scores
            # Let trial service handle the update
            response["mental_health_scores"] = deepcopy(mental_health_scores)
        else:
            response["user_Id"] = identifier
            response["mental_health_scores"] = deepcopy(mental_health_scores)
            print("<= response", response)
            search_query = {
                "user_Id": identifier,
            }
            report_list = find_data(COLLECTIONS["USERS"], search_query, 1)
            if not report_list or len(report_list) == 0:
                raise Exception(f"No report found for user_Id: {identifier}")
            report = report_list[0]
            print("report", report)
            updated_data = {
                "$set": {
                    "vital_signs": {
                        **report.get(
                            "vital_signs", {}
                        ),  # Preserve existing vital signs
                        **response["mental_health_scores"],  # Add mental health scores
                    },
                    "mental_health_scores": response[
                        "mental_health_scores"
                    ],  # Add separate field for scores
                }
            }

            res = update_data(COLLECTIONS["USERS"], search_query, updated_data)

        print(
            "stress_uncertaininty",
            round(stress_entropy, 4),
            100 * round(stress_entropy_percent, 4),
        )
        print(
            "anxiety_uncertaininty",
            round(anxiety_entropy, 4),
            100 * round(anxiety_entropy_percent, 4),
        )
        print(
            "depression_uncertaininty",
            round(depression_entropy, 4),
            100 * round(depression_entropy_percent, 4),
        )
        analytics = {
            "stress": {
                "entropy": stress_entropy,
                "entropy_percent": stress_entropy_percent,
            },
            "anxiety": {
                "entropy": anxiety_entropy,
                "entropy_percent": anxiety_entropy_percent,
            },
            "depression": {
                "entropy": depression_entropy,
                "entropy_percent": depression_entropy_percent,
            },
        }

        # Store analytics data with appropriate identifier
        if is_trial:
            analytics_with_identifier = {
                "trial_id": identifier,
                "uncertainity_metrics": analytics,
                "is_trial": True,
            }
        else:
            analytics_with_identifier = {
                "user_Id": identifier,
                "uncertainity_metrics": analytics,
            }

        analytics_with_timestamp = insert_data(
            COLLECTIONS["ANALYSIS_DATA"], analytics_with_identifier
        )

        # remove the big files
        features_outputs_path = os.path.join(
            os.getcwd(), "processingScripts", "features"
        )
        delete_directory(features_outputs_path)
        model_outputs_path = os.path.join(
            os.getcwd(), "processingScripts", "model_outputs"
        )
        delete_directory(model_outputs_path)
        final_outputs_path = os.path.join(
            os.getcwd(), "processingScripts", "final_outputs"
        )
        delete_directory(final_outputs_path)

        # Note: Don't delete media files yet for trial users
        # They will be cleaned up when the trial expires or is linked to a user
        if not is_trial:
            media_files_path = os.path.join(os.getcwd(), "media")
            delete_directory(media_files_path)

        print(
            f"Audio processing completed successfully for {'trial' if is_trial else 'user'}: {identifier}"
        )

        if is_trial:
            # For trials, return the mental health scores and analytics
            return {
                "mental_health_scores": deepcopy(mental_health_scores),
                "analytics": analytics,
            }
        else:
            return res

    except Exception as e:
        print(f"Error during audio processing: {str(e)}")
        # Clean up on error
        if os.path.exists(audio_path):
            os.remove(audio_path)
        raise Exception(f"Audio processing error: {str(e)}")
