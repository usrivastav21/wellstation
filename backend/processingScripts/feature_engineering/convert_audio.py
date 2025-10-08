import os
import ntpath
import subprocess
from ..utils.ffmpeg_utils import run_ffmpeg_command


def convert_audio(audio_path):
    basepath, filename = ntpath.split(audio_path)
    audio_filename = filename.split(".")[0]
    audio_filename += "_corrected.wav"
    new_audio_path = os.path.join(basepath, audio_filename)

    # command = f"ffmpeg -i \"{audio_path}\" -vn -acodec pcm_s16le -ar 44100 -ac 2 -y \"{new_audio_path}\""

    # Use ffmpeg utility to handle PyInstaller bundle path detection
    command_args = [
        "-i",
        audio_path,
        "-vn",
        "-acodec",
        "pcm_s16le",
        "-ar",
        "44100",
        "-ac",
        "2",
        "-y",
        new_audio_path,
    ]

    try:
        # Capture output for logging purposes
        result = run_ffmpeg_command(
            command_args,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        print(f"Conversion successful: {new_audio_path}")
        return new_audio_path
    except subprocess.CalledProcessError as e:
        print(f"Error during conversion: {e}")
        print(f"Error output: {e.stderr}")
        raise
