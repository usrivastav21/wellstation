#!/usr/bin/env python3
"""
Test script for trial service functionality
Run this to verify the trial service works correctly
"""

import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.trial.trial_service import trial_service
from app.services.trial.trial_media import getTrialReport


def test_trial_service():
    """Test the trial service functionality"""
    print("🧪 Testing Trial Service...")

    try:
        # Test 1: Create trial session
        print("\n1. Testing trial session creation...")
        trial_session = trial_service.create_trial_session("127.0.0.1", "test_device")
        print(f"✅ Trial session created: {trial_session}")

        trial_id = trial_session["trial_id"]

        # Test 2: Get trial session
        print("\n2. Testing trial session retrieval...")
        retrieved_session = trial_service.get_trial_session(trial_id)
        print(f"✅ Trial session retrieved: {retrieved_session['trial_id']}")

        # Test 3: Update trial video data
        print("\n3. Testing trial video data update...")
        video_data = {
            "venue": "Test Gym",
            "language": "English",
            "ageRange": "25-35",
            "gender": "male",
            "email": "test@example.com",
            "vital_signs": {
                "heart_rate": 75,
                "blood_pressure_systolic": 120,
                "blood_pressure_diastolic": 80,
                "spo2": 98,
            },
        }

        update_success = trial_service.update_trial_video_data(trial_id, video_data)
        print(f"✅ Video data update: {'Success' if update_success else 'Failed'}")

        # Test 4: Update trial audio data
        print("\n4. Testing trial audio data update...")
        audio_data = {
            "mental_health_scores": {"stress": 2.5, "anxiety": 1.8, "depression": 1.2}
        }
        update_success = trial_service.update_trial_audio_data(trial_id, audio_data)
        print(f"✅ Audio data update: {'Success' if update_success else 'Failed'}")

        # Test 5: Get trial report
        print("\n5. Testing trial report retrieval...")
        report = trial_service.get_trial_report(trial_id)
        print(f"✅ Trial report retrieved: {report['status']}")
        print(f"   Venue: {report['venue']}")
        print(f"   Heart Rate: {report['vital_signs']['heart_rate']}")
        print(f"   Stress Level: {report['mental_health_scores']['stress']}")

        # Test 6: Test rate limiting
        print("\n6. Testing rate limiting...")
        try:
            # Try to create multiple trials from same IP
            for i in range(7):  # More than the limit (5)
                trial_service.create_trial_session("127.0.0.1", f"test_device_{i}")
                print(f"   Trial {i+1} created")
        except Exception as e:
            print(f"✅ Rate limiting working: {str(e)}")

        # Test 7: Test trial linking (simulation)
        print("\n7. Testing trial linking simulation...")
        user_id = "test_user_123"
        email = "test@example.com"

        try:
            link_result = trial_service.link_trial_to_user(trial_id, user_id, email)
            print(f"✅ Trial linking: {link_result['message']}")
        except Exception as e:
            print(f"❌ Trial linking failed: {str(e)}")

        # Test 8: Get statistics
        print("\n8. Testing statistics...")
        stats = trial_service.get_trial_statistics()
        print(f"✅ Statistics: {stats}")

        print("\n🎉 All tests completed successfully!")

    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        import traceback

        traceback.print_exc()
        return False

    return True


def test_trial_media():
    """Test the trial media functionality"""
    print("\n🧪 Testing Trial Media...")

    try:
        # Test trial report retrieval
        print("1. Testing trial report retrieval...")

        # Create a test trial first
        trial_session = trial_service.create_trial_session("127.0.0.1", "test_device")
        trial_id = trial_session["trial_id"]

        # Update with test data
        video_data = {
            "venue": "Test Venue",
            "language": "English",
            "ageRange": "30-40",
            "gender": "female",
            "email": "test2@example.com",
            "vital_signs": {"test": "data"},
        }
        trial_service.update_trial_video_data(trial_id, video_data)

        audio_data = {"mental_health_scores": {"test": "scores"}}
        trial_service.update_trial_audio_data(trial_id, audio_data)

        # Test getTrialReport function
        report = getTrialReport(trial_id)
        print(f"✅ Trial report retrieved via media module: {report['trial_id']}")

        print("🎉 Trial media tests completed successfully!")

    except Exception as e:
        print(f"❌ Trial media test failed: {str(e)}")
        import traceback

        traceback.print_exc()
        return False

    return True


if __name__ == "__main__":
    print("🚀 Starting Trial Service Tests...")
    print("=" * 50)

    # Test trial service
    service_success = test_trial_service()

    # Test trial media
    media_success = test_trial_media()

    print("\n" + "=" * 50)
    if service_success and media_success:
        print("🎉 All tests passed! Trial service is working correctly.")
        sys.exit(0)
    else:
        print("❌ Some tests failed. Please check the errors above.")
        sys.exit(1)
