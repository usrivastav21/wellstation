# Imports
import os
import math
from multiprocessing import Pool, Process, Value, Array, Manager

from scipy import signal
from scipy import sparse
import cv2
import numpy as np
import pandas as pd

# Functions
def face_detection(frame, backend, use_larger_box=False, larger_box_coef=1.0):
    """Face detection on a single frame.

    Args:
        frame(np.array): a single frame.
        backend(str): backend to utilize for face detection.
        use_larger_box(bool): whether to use a larger bounding box on face detection.
        larger_box_coef(float): Coef. of larger box.
    Returns:
        face_box_coor(List[int]): coordinates of face bouding box.
    """
    if backend == "HC":
        # Use OpenCV's Haar Cascade algorithm implementation for face detection
        # This should only utilize the CPU
        detector = cv2.CascadeClassifier(cv2.data.haarcascades + os.sep + 'haarcascade_frontalface_default.xml')

        # Computed face_zone(s) are in the form [x_coord, y_coord, width, height]
        # (x,y) corresponds to the top-left corner of the zone to define using
        # the computed width and height.
        face_zone = detector.detectMultiScale(frame)

        if len(face_zone) < 1:
            print("ERROR: No Face Detected")
            face_box_coor = [0, 0, frame.shape[0], frame.shape[1]]
        elif len(face_zone) >= 2:
            # Find the index of the largest face zone
            # The face zones are boxes, so the width and height are the same
            max_width_index = np.argmax(face_zone[:, 2])  # Index of maximum width
            face_box_coor = face_zone[max_width_index]
            print("Warning: More than one faces are detected. Only cropping the biggest one.")
        else:
            face_box_coor = face_zone[0]
    else:
        raise ValueError("Unsupported face detection backend!")

    if use_larger_box:
        face_box_coor[0] = max(0, face_box_coor[0] - (larger_box_coef - 1.0) / 2 * face_box_coor[2])
        face_box_coor[1] = max(0, face_box_coor[1] - (larger_box_coef - 1.0) / 2 * face_box_coor[3])
        face_box_coor[2] = larger_box_coef * face_box_coor[2]
        face_box_coor[3] = larger_box_coef * face_box_coor[3]
    return face_box_coor

def crop_face_resize(frames, use_face_detection, backend, use_larger_box, larger_box_coef, use_dynamic_detection, 
                     detection_freq, use_median_box, width, height):
    """Crop face and resize frames.

    Args:
        frames(np.array): Video frames.
        use_dynamic_detection(bool): If False, all the frames use the first frame's bouding box to crop the faces
                                     and resizing.
                                     If True, it performs face detection every "detection_freq" frames.
        detection_freq(int): The frequency of dynamic face detection e.g., every detection_freq frames.
        width(int): Target width for resizing.
        height(int): Target height for resizing.
        use_larger_box(bool): Whether enlarge the detected bouding box from face detection.
        use_face_detection(bool):  Whether crop the face.
        larger_box_coef(float): the coefficient of the larger region(height and weight),
                            the middle point of the detected region will stay still during the process of enlarging.
    Returns:
        resized_frames(list[np.array(float)]): Resized and cropped frames
    """
    # Face Cropping
    if use_dynamic_detection:
        num_dynamic_det = math.ceil(frames.shape[0] / detection_freq)
    else:
        num_dynamic_det = 1
    face_region_all = []
    # Perform face detection by num_dynamic_det" times.
    for idx in range(num_dynamic_det):
        if use_face_detection:
            face_region_all.append(face_detection(frames[detection_freq * idx], backend, use_larger_box, larger_box_coef))
        else:
            face_region_all.append([0, 0, frames.shape[1], frames.shape[2]])
    face_region_all = np.asarray(face_region_all, dtype='int')
    if use_median_box:
        # Generate a median bounding box based on all detected face regions
        face_region_median = np.median(face_region_all, axis=0).astype('int')

    # Frame Resizing
    resized_frames = np.zeros((frames.shape[0], height, width, 3))
    for i in range(0, frames.shape[0]):
        frame = frames[i]
        if use_dynamic_detection:  # use the (i // detection_freq)-th facial region.
            reference_index = i // detection_freq
        else:  # use the first region obtrained from the first frame.
            reference_index = 0
        if use_face_detection:
            if use_median_box:
                face_region = face_region_median
            else:
                face_region = face_region_all[reference_index]
            frame = frame[max(face_region[1], 0):min(face_region[1] + face_region[3], frame.shape[0]),
                    max(face_region[0], 0):min(face_region[0] + face_region[2], frame.shape[1])]
        resized_frames[i] = cv2.resize(frame, (width, height), interpolation=cv2.INTER_AREA)
    return resized_frames

def diff_normalize_data(data):
    """Calculate discrete difference in video data along the time-axis and nornamize by its standard deviation."""
    N, H, W, C = data.shape
    diffnormalized_len = N - 1
    print(diffnormalized_len, H, W, C)
    diffnormalized_data = np.zeros((diffnormalized_len, H, W, C), dtype=np.float32)
    diffnormalized_data_padding = np.zeros((1, H, W, C), dtype=np.float32)
    for j in range(diffnormalized_len):
        diffnormalized_data[j, :, :, :] = (data[j + 1, :, :, :] - data[j, :, :, :]) / (
                data[j + 1, :, :, :] + data[j, :, :, :] + 1e-7)
    diffnormalized_data = diffnormalized_data / np.std(diffnormalized_data)
    diffnormalized_data = np.append(diffnormalized_data, diffnormalized_data_padding, axis=0)
    diffnormalized_data[np.isnan(diffnormalized_data)] = 0
    return diffnormalized_data

def standardized_data(data):
    """Z-score standardization for video data."""
    data = data - np.mean(data)
    data = data / np.std(data)
    data[np.isnan(data)] = 0
    return data

def chunk(frames, chunk_length):
    """Chunk the data into small chunks.

    Args:
        frames(np.array): video frames.
        bvps(np.array): blood volumne pulse (PPG) labels.
        chunk_length(int): the length of each chunk.
    Returns:
        frames_clips: all chunks of face cropped frames
        bvp_clips: all chunks of bvp frames
    """

    clip_num = frames.shape[0] // chunk_length
    frames_clips = [frames[i * chunk_length:(i + 1) * chunk_length] for i in range(clip_num)]
    #bvps_clips = [bvps[i * chunk_length:(i + 1) * chunk_length] for i in range(clip_num)]
    return np.array(frames_clips) #, np.array(bvps_clips)

def preprocess(frames):
    frames = crop_face_resize(frames, use_face_detection=True, backend='HC', use_larger_box=True, larger_box_coef=1.5,
                              use_dynamic_detection=True, detection_freq=30, use_median_box=False, width=72, height=72)
    # diffnormalization and standardization
    data = list()
    data.append(diff_normalize_data(frames.copy()))
    data.append(standardized_data(frames.copy()))
    data = np.concatenate(data, axis=-1)  # concatenate all channels
    frames_clips = chunk(data, chunk_length=160)
    #print(f'data.shape - {data.shape}, frames_clips.shape - {frames_clips.shape}')
    return frames_clips

def extract_video_features(video_path, features_dir, return_filelist=True):
    print(video_path)
    cap = cv2.VideoCapture(video_path)
    #frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    #print(frame_count, frame_height, frame_width)
    print(frame_height, frame_width)
    #video_array = np.empty((frame_count, frame_height, frame_width, 3), np.dtype('uint8'))
    
    fc = 0
    ret = True
    frame_count = 0
    video_array = list()
    while ret:
        ret, current_array = cap.read()
        if not ret:
            print(frame_count, current_array)
            continue
        current_array.astype('uint8', copy=False)
        video_array.append(current_array.copy())
        frame_count += 1
    cap.release()
    video_array = np.array(video_array, dtype='uint8')
    
    frames_clips = preprocess(video_array)
    filename = os.path.basename(video_path).split('.')[0]
    #np.save(features_dir + os.sep + filename + '_features.npy', frames_clips)
    features_paths = save(frames_clips, filename, features_dir)
    print(f"{video_path} processed. {len(features_paths)} chunks.")
    if return_filelist:
        return features_paths
    else:
        return list()

def save(frames_clips, filename, features_dir):
    if not os.path.exists(features_dir):
        os.mkdir(features_dir)
    features_paths = list()
    for i in range(frames_clips.shape[0]):
        features_path_name = features_dir + os.sep + "{0}_features_{1}.npy".format(filename, str(i).zfill(4))
        np.save(features_path_name, np.transpose(frames_clips[i], (0, 3, 1, 2)))
        features_paths.append(features_path_name)
    return features_paths

