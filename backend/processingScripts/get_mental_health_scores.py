# Imports
import os
import argparse
import json

import numpy as np


def get_mental_health_scores(output_dir, stress_severity, anxiety_severity, depression_severity, fallback_logic=False):
	
	mental_health_scores = dict()
	
	# stress prediction
	if fallback_logic:
		stress_severity = np.random.choice(['low', 'medium', 'high'], size=None, p=[0.8164557 , 0.12658228, 0.05696203])
	mental_health_scores['stress'] = stress_severity
	
	# anxiety prediction
	if fallback_logic:
		anxiety_severity = np.random.choice(['low', 'medium', 'high'], size=None, p=[0.51898734, 0.29113924, 0.18987342])
	mental_health_scores['anxiety'] = anxiety_severity
	
	# stress prediction
	if fallback_logic:
		depression_severity = np.random.choice(['low', 'medium', 'high'], size=None, p=[0.75316456, 0.18987342, 0.05696203])
	mental_health_scores['depression'] = depression_severity
	
	with open(os.path.join(output_dir, 'mental_health_scores.json'), 'w') as f:
		json.dump(mental_health_scores, f)
	
	return mental_health_scores
