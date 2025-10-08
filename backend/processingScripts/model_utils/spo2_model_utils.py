import os
import ntpath
import pickle

import numpy as np

def get_spo2(spo2_model_path, pred_file_list):
    with open(spo2_model_path, 'rb') as f:
        spo2_model = pickle.load(f)
    labels = spo2_model['labels']
    print(labels)
    for pred_file in pred_file_list:
        ppg_pred = np.load(pred_file)
        spo2_pred = spo2_from_signal(labels, spo2_model, ppg_pred)
        print(pred_file, spo2_pred)
    final_pred = spo2_pred

    return final_pred

def spo2_from_signal(labels, spo2_model, ppg_signal):
    w = spo2_model['spo2_w']
    print('loaded w')
    ppg_signal_cum = np.cumsum(ppg_signal)
    w_cum = np.cumsum(w)
    index_ = get_index(w_cum, ppg_signal_cum)
    return labels[index_]

def get_index(w_cum, ppg_signal_cum):
    b = np.random.rand()*w_cum[-1]
    i = np.searchsorted(w_cum, b)
    return i
