import os
import ntpath
import argparse
import json

import onnxruntime as ort
import numpy as np


def main():
    parser = argparse.ArgumentParser(description='Run the model to predict vital signs from features.')
    parser.add_argument('--heart_rate', action='store_false', help='Run the heart_rate model.')
    parser.add_argument('--video_features_file', required=True, help="Full path to read feature numpy file.")
    default_model_output_directory = os.path.dirname(os.path.realpath(__file__)) + os.sep + 'model_outputs'
    parser.add_argument('--model_output_dir', required=False, default=default_model_output_directory, help="Full path to store model output.")
    args = parser.parse_args()
    
    if args.heart_rate:
        # Load the ONNX model
        onnx_path = os.path.dirname(os.path.realpath(__file__)) + os.sep + "models" + os.sep + "hr_model.onnx"
        ort_session = ort.InferenceSession(onnx_path)
        
        # Load features from numpy file
        features = np.load(args.video_features_file)
        
        # Prepare the input dictionary
        input_name = ort_session.get_inputs()[0].name
        output_name = ort_session.get_outputs()[0].name 
        print("<= values",input_name, output_name )
        inputs = {input_name: features.astype(np.float32)}
        
        # Run the inference
        outputs = ort_session.run([output_name], inputs)
        
        # store the outputs
        feature_file_name = ntpath.basename(args.video_features_file).split('.')[0]
        if '_features' in feature_file_name:
            feature_file_name = feature_file_name.split('_features')[0]
        output_file_name = feature_file_name + '_hr_prediction.npy'
        if not os.path.exists(args.model_output_dir):
            os.mkdir(args.model_output_dir)
        np.save(args.model_output_dir + os.sep + output_file_name, outputs[0]) 
    

if __name__=="__main__":
    main()
