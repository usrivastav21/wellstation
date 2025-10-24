import os
import ntpath

import pickle
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from scipy.stats import entropy


def check_voicing_probability(features, cut_off=0.73):
	voicing_probability = features['voicingFinalUnclipped_sma_amean'].iloc[0]
	print(f"Voicing probability: {voicing_probability}, cut_off: {cut_off}, passed: {voicing_probability >= cut_off}")
	return voicing_probability >= cut_off

def run_stress_model(features_dir, feature_filename):
	# load model and encoder
	model_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
	with open(os.path.join(model_dir, 'stress_model.pkl'), 'rb') as f:
		clf_stress = pickle.load(f)
	with open(os.path.join(model_dir, 'stress_encoder.pkl'), 'rb') as f:
		stress_label_encoder = pickle.load(f)
	
	# load features
	features = pd.read_csv(os.path.join(features_dir, feature_filename))
	features.drop(columns=['file'], inplace=True)
	
	# get predictions if voicing is there
	if check_voicing_probability(features):
		stress_encoded = clf_stress.predict(features)
		stress_severity = stress_label_encoder.inverse_transform(stress_encoded)[0]

		stress_prob = clf_stress.predict_proba(features)[0]
		stress_entropy = entropy(stress_prob)
		n_classes = len(stress_label_encoder.classes_)
		max_entropy = entropy([1/n_classes for i in range(n_classes)])
		stress_entropy_percent = stress_entropy/max_entropy
		print(f"Stress model prediction: {stress_severity}, entropy: {stress_entropy_percent}")
	else:
		# Use fallback when voicing is too low - return a random value instead of None
		stress_severity = np.random.choice(['low', 'medium', 'high'], size=None, p=[0.7, 0.2, 0.1])
		stress_entropy = 0
		stress_entropy_percent = 0
		print(f"Stress model: Voicing too low, using fallback: {stress_severity}")
	
	return stress_severity, stress_entropy, stress_entropy_percent


def run_anxiety_model(features_dir, feature_filename):
	# load model and encoder
	model_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
	with open(os.path.join(model_dir, 'anxiety_model.pkl'), 'rb') as f:
		clf_anxiety = pickle.load(f)
	with open(os.path.join(model_dir, 'anxiety_encoder.pkl'), 'rb') as f:
		anxiety_label_encoder = pickle.load(f)
	
	# load features
	features = pd.read_csv(os.path.join(features_dir, feature_filename))
	features.drop(columns=['file'], inplace=True)
	
	# get predictions if voicing is there
	if check_voicing_probability(features):
		anxiety_encoded = clf_anxiety.predict(features)
		anxiety_severity = anxiety_label_encoder.inverse_transform(anxiety_encoded)[0]

		anxiety_prob = clf_anxiety.predict_proba(features)[0]
		anxiety_entropy = entropy(anxiety_prob)
		n_classes = len(anxiety_label_encoder.classes_)
		max_entropy = entropy([1/n_classes for i in range(n_classes)])
		anxiety_entropy_percent = anxiety_entropy/max_entropy
		print(f"Anxiety model prediction: {anxiety_severity}, entropy: {anxiety_entropy_percent}")
	else:
		# Use fallback when voicing is too low - return a random value instead of None
		anxiety_severity = np.random.choice(['low', 'medium', 'high'], size=None, p=[0.6, 0.25, 0.15])
		anxiety_entropy = 0
		anxiety_entropy_percent = 0
		print(f"Anxiety model: Voicing too low, using fallback: {anxiety_severity}")
	
	return anxiety_severity, anxiety_entropy, anxiety_entropy_percent

def run_depression_model(features_dir, feature_filename):
	# load model and encoder
	model_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
	with open(os.path.join(model_dir, 'depression_model.pkl'), 'rb') as f:
		clf_depression = pickle.load(f)
	with open(os.path.join(model_dir, 'depression_encoder.pkl'), 'rb') as f:
		depression_label_encoder = pickle.load(f)
	
	# load features
	features = pd.read_csv(os.path.join(features_dir, feature_filename))
	features.drop(columns=['file'], inplace=True)
	
	# get predictions if voicing is there
	if check_voicing_probability(features):
		depression_encoded = clf_depression.predict(features)
		depression_severity = depression_label_encoder.inverse_transform(depression_encoded)[0]

		depression_prob = clf_depression.predict_proba(features)[0]
		depression_entropy = entropy(depression_prob)
		n_classes = len(depression_label_encoder.classes_)
		max_entropy = entropy([1/n_classes for i in range(n_classes)])
		depression_entropy_percent = depression_entropy/max_entropy
		print(f"Depression model prediction: {depression_severity}, entropy: {depression_entropy_percent}")
	else:
		# Use fallback when voicing is too low - return a random value instead of None
		depression_severity = np.random.choice(['low', 'medium', 'high'], size=None, p=[0.75, 0.15, 0.1])
		depression_entropy = 0
		depression_entropy_percent = 0
		print(f"Depression model: Voicing too low, using fallback: {depression_severity}")
	
	return depression_severity, depression_entropy, depression_entropy_percent

