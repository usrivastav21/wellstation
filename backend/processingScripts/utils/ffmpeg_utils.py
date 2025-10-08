import os
import sys
import subprocess


def get_ffmpeg_path():
    """
    Get the appropriate ffmpeg path for the current environment.

    Returns:
        str: Path to ffmpeg executable
    """
    # Check if running in a PyInstaller bundle
    if getattr(sys, "frozen", False):
        # Running in a PyInstaller bundle
        bundle_dir = sys._MEIPASS

        # Look for ffmpeg in the bundle directory
        ffmpeg_path = os.path.join(bundle_dir, "ffmpeg")

        # On Windows, add .exe extension
        if sys.platform.startswith("win"):
            ffmpeg_path += ".exe"

        # Check if ffmpeg exists in the bundle
        if os.path.exists(ffmpeg_path) and os.access(ffmpeg_path, os.X_OK):
            return ffmpeg_path

    # Fallback to system ffmpeg
    return "ffmpeg"


def run_ffmpeg_command(command_args, **kwargs):
    """
    Run an ffmpeg command with proper path detection.

    Args:
        command_args (list): List of command arguments (excluding ffmpeg itself)
        **kwargs: Additional arguments to pass to subprocess.run

    Returns:
        subprocess.CompletedProcess: Result of the subprocess call
    """
    ffmpeg_path = get_ffmpeg_path()
    full_command = [ffmpeg_path] + command_args

    return subprocess.run(full_command, **kwargs)


def run_ffmpeg_shell_command(command_string, **kwargs):
    """
    Run an ffmpeg command as a shell command with proper path detection.

    Args:
        command_string (str): Full ffmpeg command string
        **kwargs: Additional arguments to pass to subprocess.call

    Returns:
        int: Return code of the subprocess call
    """
    ffmpeg_path = get_ffmpeg_path()

    # Replace "ffmpeg" with the actual path if it's at the beginning of the command
    if command_string.startswith("ffmpeg "):
        command_string = command_string.replace("ffmpeg ", f"{ffmpeg_path} ", 1)

    return subprocess.call(command_string, shell=True, **kwargs)
