import os
import ntpath
import pickle

import numpy as np
from scipy.interpolate import interp1d


def generate_from_saved_ecdf(ecdf_data, num_samples, lower_limit, upper_limit):
    sorted_data, ecdf = ecdf_data
    uniform_samples = np.random.uniform(0, 1, num_samples)
    inverse_ecdf = interp1d(ecdf, sorted_data, kind='linear', bounds_error=False, fill_value=(sorted_data[0], sorted_data[-1]))
    random_samples = list(inverse_ecdf(uniform_samples))
    random_samples = [int(i) for i in random_samples]
    random_samples = [i if i>=lower_limit else lower_limit for i in random_samples]
    random_samples = [i if i<=upper_limit else upper_limit for i in random_samples]
    return np.array(random_samples)


def get_bp(bp_dia_model_path, bp_sys_model_path):
	print('in get_bp', bp_dia_model_path, bp_sys_model_path)
	
	with open(bp_dia_model_path, 'rb') as f:
		ecdf_data_bp_dia = pickle.load(f)
	bp_dia = generate_from_saved_ecdf(ecdf_data_bp_dia, num_samples=1, lower_limit=65, upper_limit=105)
	bp_dia = int(bp_dia[0])
	
	with open(bp_sys_model_path, 'rb') as f:
		ecdf_data_bp_sys = pickle.load(f)
	bp_sys = generate_from_saved_ecdf(ecdf_data_bp_sys, num_samples=1, lower_limit=95, upper_limit=150)
	bp_sys = int(bp_sys[0])
	
	# sanity check
	if bp_sys-bp_dia<=20:
		bp_sys = bp_dia + np.random.randint(35, 45)
	
	return bp_sys, bp_dia
	
