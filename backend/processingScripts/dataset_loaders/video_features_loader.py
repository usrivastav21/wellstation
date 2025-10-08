# Imports
import os
import ntpath

import numpy as np
from torch.utils.data import Dataset


class Dataset_wrapper(Dataset):
    def __init__(self, features_dir, features_paths=None):
        self.features_dir = features_dir
        if not features_paths:
            self.generate_features_paths()
        else:
            self.features_paths = features_paths
        self.features_paths_dict = list()
        self.generate_features_paths_dict()
        
    def generate_features_paths(self):
        self.featues_paths = list()
        for f in os.listdir(self.features_dir):
            # filename structure - {original_video_name}_features_{chunk_id}.npy
            if '.npy' not in f:
                continue
            curr_path = os.path.join(self.features_dir, f)
            self.features_paths.append(curr_path)
    
    def generate_features_paths_dict(self):
        """Creates a list of video feature .npy files."""
        self.features_paths_dict = list()
        for curr_path in self.features_paths:
            f = ntpath.basename(curr_path)
            video_name, chunk_id = self.get_chunk_id_from_filename(f)
            self.features_paths_dict.append({'video_name': video_name, 'path': curr_path, 'chunk_id': chunk_id})
        self.features_paths_dict = sorted(self.features_paths_dict, key=lambda d:d['video_name'], reverse = False)
    
    def get_chunk_id_from_filename(self, f):
        # filename structure - {original_video_name}_features_{chunk_id}.npy
        chunk_id_index = f.index('features_')
        chunk_id = int(f[chunk_id_index+9:chunk_id_index+9+4]) # 9=len(features_), 4=len(chunk_id)
        video_name = f[:chunk_id_index-1]
        return video_name, chunk_id
        
    def __len__(self):
        return len(self.features_paths_dict)

    def __getitem__(self, index):
        data = np.load(self.features_paths_dict[index]['path'])
        #print(data.shape)
        data = np.float32(data)
        return data, self.features_paths_dict[index]['video_name'], self.features_paths_dict[index]['chunk_id']

    def get_features_paths_dict(self):
        return self.features_paths_dict
