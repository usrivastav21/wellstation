# Imports
import os
import argparse
import json

import numpy as np

from .postprocessing.hr_from_ppg import calculate_hr


# main function
def get_vital_signs(pred_file_list, output_dir, bp_sys, bp_dia, spo2):
    
    print('starting.')
    vital_signs = dict()
    
    # HR prediction
    hr_preds = list()
    for pred_file in pred_file_list:
        ppg_pred = np.load(pred_file)
        hr_pred = calculate_hr(ppg_pred)
        hr_preds.append(hr_pred)
    final_hr_prediction = round(np.mean(hr_preds))
    vital_signs['heart_rate'] = final_hr_prediction
    print('done with hr.')
    # BP prediction
    vital_signs['blood_pressure_systolic'] = bp_sys
    vital_signs['blood_pressure_diastolic'] = bp_dia
    print('done with bp')
    # spo2 prediction
    vital_signs['spo2'] = int(spo2)
    print('done with spo2.')
    # saving all predictions
    with open(os.path.join(output_dir, 'vital_signs.json'), 'w') as f:
        json.dump(vital_signs, f)
    
    return vital_signs
