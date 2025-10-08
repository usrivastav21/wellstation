# Imports
import os
import ntpath
import argparse
import json

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
import numpy as np

from .model_definitions.DeepPhys import DeepPhys
from .dataset_loaders.video_features_loader import Dataset_wrapper
from .model_utils.bp_model_utils import get_bp
from .model_utils.spo2_model_utils import get_spo2


# Heart rate model
def run_hr_model(features_dir, features_paths, preds_dir):
	# set torch device
	device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

	# prepare dataset iterator
	dataset = Dataset_wrapper(features_dir=features_dir, features_paths=features_paths)
	data_iterator = DataLoader(dataset)
	
	# load model
	model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models', 'hr_model.pth')
	print(model_path)
	model = DeepPhys(img_size=72).to(device)
	model = nn.DataParallel(model, device_ids=list(range(1)))
	model.load_state_dict(torch.load(model_path, map_location=device))  # Added map_location parameter
	model.eval()
	
	# run inference
	with torch.no_grad():
		pred_file_list = list()
		for batch in data_iterator:
			# get prediction
			batch_data = batch[0].to(device)
			N, D, C, H, W = batch_data.shape
			batch_data = batch_data.view(N * D, C, H, W)
			diff_pred_ppg = model(batch_data)
			
			# save prediction
			video_name = batch[1][0]
			chunk_id = int(batch[2][0])
			diff_pred_file_name = video_name + '_preds_' + str(chunk_id).zfill(4) + '.npy'
			diff_pred_file_path = os.path.join(preds_dir, diff_pred_file_name)
			diff_pred_ppg = np.array(diff_pred_ppg.cpu())
			np.save(diff_pred_file_path, diff_pred_ppg)
			pred_file_list.append(diff_pred_file_path)
	
	return pred_file_list
	
def run_bp_model(features_dir, features_path, preds_dir):
	print('starting bp')
	model_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
	bp_dia_model_path = os.path.join(model_dir, 'bp_dia_ecdf.pkl')
	bp_sys_model_path = os.path.join(model_dir, 'bp_sys_ecdf.pkl')
	
	bp_sys, bp_dia = get_bp(bp_dia_model_path=bp_dia_model_path, bp_sys_model_path=bp_sys_model_path)
	return bp_sys, bp_dia

def run_spo2_model(features_dir, features_path, preds_dir):
	print('starting spo2.')
	model_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
	spo2_model_path = os.path.join(model_dir, 'spo2_model.pkl')

	pred_file_list = [os.path.join(preds_dir, i) for i in os.listdir(preds_dir)]
	spo2 = get_spo2(spo2_model_path, pred_file_list)
	return spo2