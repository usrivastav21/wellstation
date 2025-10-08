import os
import argparse
import json

import torch
import onnx
import onnxruntime as ort
import numpy as np
from model_definitions import SimpleCNN

def __main__():
    parser = argparse.ArgumentParser(description='Run the model to predict vital signs from features.')
    parser.add_argument('--dummy', action='store_false', help='Run the dummy model.')
    args = parser.parse_args()
    
    predictions = dict()
    if parser.dummy:
        # Load the ONNX model
        onnx_path = os.path.dirname(os.path.realpath(__file__)) + os.sep + "models" + os.sep "simple_cnn.onnx"
        onnx_model = onnx.load(onnx_path)
        
        # Check the model
        onnx.checker.check_model(onnx_model)
        
        # Create an ONNX Runtime session
        ort_session = ort.InferenceSession(onnx_path)
        
        # Generate dummy input
        dummy_input = np.random.randn(1, 1, 28, 28).astype(np.float32)
        
        # Make predictions
        ort_inputs = {ort_session.get_inputs()[0].name: dummy_input}
        ort_outs = ort_session.run(None, ort_inputs)
        
        predictions['dummy'] = list(ort_outs[0][0,:])
    
    with open('model_output.json', 'w') as f:
        json.dump(predictions, f, indent=4)

if __name__=="__main__":
    main()