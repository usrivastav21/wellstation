## Imports
import argparse
import os
import ntpath
import random

import numpy as np

# import librosa
# from scipy.io.wavfile import audio_file_read

from feature_engineering.extract_video_features import extract_video_features
from feature_engineering.extract_audio_features import extract_audio_features
from .utils.ffmpeg_utils import run_ffmpeg_shell_command

## set random seed if required
RANDOM_SEED = 100
np.random.seed(RANDOM_SEED)
random.seed(RANDOM_SEED)


def seed_worker(worker_id):
    worker_seed = torch.initial_seed() % 2**32
    np.random.seed(worker_seed)
    random.seed(worker_seed)


def main():
    parser = argparse.ArgumentParser(
        description="Extract features from video and audio files."
    )
    parser.add_argument("--video_path", type=str, help="Path to the video file.")
    parser.add_argument("--audio_path", type=str, help="Path to the audio file.")
    parser.add_argument(
        "--mode",
        type=str,
        required=True,
        choices=["video_only", "audio_only", "both", "extract_audio"],
        help="Run mode.",
    )
    default_output_directory = (
        os.path.dirname(os.path.realpath(__file__)) + os.sep + "features"
    )
    if not os.path.exists(default_output_directory):
        os.mkdir(default_output_directory)
    parser.add_argument(
        "--output_data_directory_path",
        required=False,
        default=default_output_directory,
        help="Full path to store output numpy files.",
    )
    args = parser.parse_args()

    if args.mode in ["video_only", "both", "extract_audio"]:
        video_name = ntpath.basename(args.video_path)
        video_name = video_name[: video_name.rindex(".")]
        video_array = extract_video_features(
            args.video_path, args.output_data_directory_path
        )

    audio_path = args.audio_path
    if args.mode == "extract_audio":
        audio_path = (
            args.output_data_directory_path + os.sep + video_name + "_audio.wav"
        )
        command = (
            f"ffmpeg -i {args.video_path} -ab 160k -ac 2 -ar 44100 -vn {audio_path}"
        )
        run_ffmpeg_shell_command(command)

    if args.mode in ["extract_audio", "audio_only", "both"]:
        audio_array = extract_audio_features(audio_path)
        audio_name = ntpath.basename(audio_path)
        audio_name = audio_name[: audio_name.rindex(".")]
        np.save(
            args.output_data_directory_path + os.sep + audio_name + "_audio.npy",
            audio_array,
        )


if __name__ == "__main__":
    main()
