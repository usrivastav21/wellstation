#!/usr/bin/env python3
"""
Test script to verify audio library imports work correctly.
This helps diagnose PyInstaller bundling issues.
"""

import sys
import os


def test_imports():
    """Test importing audio processing libraries."""
    print("Testing audio library imports...")

    try:
        import audresample

        print(f"✅ audresample imported successfully: {audresample._file_}")

        # Test audresample core
        import audresample.core

        print(f"✅ audresample.core imported successfully: {audresample.core._file_}")

        # Test audresample core api
        import audresample.core.api

        print(
            f"✅ audresample.core.api imported successfully: {audresample.core.api._file_}"
        )

        # Test audresample core lib
        import audresample.core.lib

        print(
            f"✅ audresample.core.lib imported successfully: {audresample.core.lib._file_}"
        )

    except ImportError as e:
        print(f"❌ Failed to import audresample: {e}")
        return False

    try:
        import audinterface

        print(f"✅ audinterface imported successfully: {audinterface._file_}")

        # Test audinterface core
        import audinterface.core

        print(f"✅ audinterface.core imported successfully: {audinterface.core._file_}")

        # Test audinterface core utils
        import audinterface.core.utils

        print(
            f"✅ audinterface.core.utils imported successfully: {audinterface.core.utils._file_}"
        )

    except ImportError as e:
        print(f"❌ Failed to import audinterface: {e}")
        return False

    try:
        import opensmile

        print(f"✅ opensmile imported successfully: {opensmile._file_}")

        # Test opensmile core
        import opensmile.core

        print(f"✅ opensmile.core imported successfully: {opensmile.core._file_}")

        # Test opensmile core config
        import opensmile.core.config

        print(
            f"✅ opensmile.core.config imported successfully: {opensmile.core.config._file_}"
        )

    except ImportError as e:
        print(f"❌ Failed to import opensmile: {e}")
        return False

    print("✅ All audio libraries imported successfully!")
    return True


def test_dll_paths():
    """Test if DLL files exist in expected locations."""
    print("\nTesting DLL file locations...")

    try:
        import audresample

        audresample_path = os.path.dirname(audresample._file_)
        print(f"audresample path: {audresample_path}")

        # Check for DLL in different possible directories
        possible_dirs = ["win64", "win_amd64", "win_x64"]
        for dir_name in possible_dirs:
            dll_path = os.path.join(
                audresample_path, "core", "bin", dir_name, "audresample.dll"
            )
            if os.path.exists(dll_path):
                print(f"✅ Found audresample.dll in {dir_name}: {dll_path}")
                break
        else:
            print("❌ audresample.dll not found in any expected directory")

    except Exception as e:
        print(f"❌ Error checking audresample DLL: {e}")

    try:
        import opensmile

        opensmile_path = os.path.dirname(opensmile._file_)
        print(f"opensmile path: {opensmile_path}")

        # Check for DLL in different possible directories
        possible_dirs = ["win64", "win_amd64", "win_x64"]
        for dir_name in possible_dirs:
            dll_path = os.path.join(
                opensmile_path, "core", "bin", dir_name, "SMILEapi.dll"
            )
            if os.path.exists(dll_path):
                print(f"✅ Found SMILEapi.dll in {dir_name}: {dll_path}")
                break
        else:
            print("❌ SMILEapi.dll not found in any expected directory")

    except Exception as e:
        print(f"❌ Error checking opensmile DLL: {e}")


if __name__ == "__main__":
    print("=" * 50)
    print("Audio Library Import Test")
    print("=" * 50)

    success = test_imports()
    test_dll_paths()

    print("\n" + "=" * 50)
    if success:
        print("✅ All tests passed!")
        sys.exit(0)
    else:
        print("❌ Some tests failed!")
        sys.exit(1)
