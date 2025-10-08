import os
import ntpath

import pandas as pd
import numpy as np
import opensmile

from .convert_audio import convert_audio


def extract_audio_features(audio_path, features_dir):
    # configure opensmile extractor
    print(f"Initializing OpenSMILE feature extractor for {audio_path}")
    smile = opensmile.Smile(
    feature_set=opensmile.FeatureSet.ComParE_2016,
    feature_level=opensmile.FeatureLevel.Functionals)
    
    # extract features
    print(f"Extracting features from {audio_path}")
    try:
        features = smile.process_file(audio_path)
    except Exception as e:
        print(f"Error processing {audio_path}, attempting audio conversion: {str(e)}")
        new_audio_path = convert_audio(audio_path)
        print(f"Successfully converted audio, retrying feature extraction")
        features = smile.process_file(new_audio_path)
    
    print("Post-processing extracted features")
    features.reset_index(inplace=True)
    features.drop(columns=['start', 'end'], inplace=True)
    
    # write features to features dir
    audio_filename = ntpath.basename(audio_path).split('.')[0]
    feature_filename = audio_filename + '.csv'
    output_path = os.path.join(features_dir, feature_filename)
    print(f"Saving features to {output_path}")
    features.to_csv(output_path, index=False)
    
    print(f"Successfully extracted and saved features for {audio_path}")
    return feature_filename
