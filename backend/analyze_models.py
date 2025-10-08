#!/usr/bin/env python3
"""
Temporary script to analyze sklearn models and their dependencies.
This will help identify what hidden imports are needed for PyInstaller.
"""

import os
import pickle
from pathlib import Path


def analyze_model(model_path):
    """Analyze a sklearn model to determine its type and dependencies."""
    try:
        with open(model_path, "rb") as f:
            model = pickle.load(f)

        print(f"\n📊 Model: {os.path.basename(model_path)}")
        print(f"   Type: {type(model).__name__}")
        print(f"   Module: {type(model).__module__}")

        # Get more specific information based on model type
        if hasattr(model, "estimators_"):
            print(f"   Estimator type: {type(model.estimators_[0]).__name__}")
            print(f"   Number of estimators: {len(model.estimators_)}")

        if hasattr(model, "feature_importances_"):
            print(f"   Has feature importances: Yes")

        if hasattr(model, "classes_"):
            print(f"   Classes: {model.classes_}")

        # Check for specific sklearn attributes
        sklearn_attrs = ["_estimator_type", "n_features_in_", "n_outputs_"]
        for attr in sklearn_attrs:
            if hasattr(model, attr):
                print(f"   {attr}: {getattr(model, attr)}")

        return type(model).__module__

    except Exception as e:
        print(f"\n❌ Error analyzing {model_path}: {e}")
        return None


def analyze_encoder(encoder_path):
    """Analyze a LabelEncoder to determine its dependencies."""
    try:
        with open(encoder_path, "rb") as f:
            encoder = pickle.load(f)

        print(f"\n🔧 Encoder: {os.path.basename(encoder_path)}")
        print(f"   Type: {type(encoder).__name__}")
        print(f"   Module: {type(encoder).__module__}")

        if hasattr(encoder, "classes_"):
            print(f"   Classes: {encoder.classes_}")

        return type(encoder).__module__

    except Exception as e:
        print(f"\n❌ Error analyzing {encoder_path}: {e}")
        return None


def main():
    """Main analysis function."""
    print("🔍 Analyzing sklearn models and their dependencies...")

    # Get the models directory
    models_dir = Path(__file__).parent / "processingScripts" / "models"

    if not models_dir.exists():
        print(f"❌ Models directory not found: {models_dir}")
        return

    # Analyze sklearn models
    sklearn_models = ["stress_model.pkl", "anxiety_model.pkl", "depression_model.pkl"]

    # Analyze encoders
    encoders = ["stress_encoder.pkl", "anxiety_encoder.pkl", "depression_encoder.pkl"]

    modules_found = set()

    print("\n" + "=" * 60)
    print("ANALYZING SKLEARN MODELS")
    print("=" * 60)

    for model_file in sklearn_models:
        model_path = models_dir / model_file
        if model_path.exists():
            module = analyze_model(model_path)
            if module:
                modules_found.add(module)
        else:
            print(f"\n⚠️  Model not found: {model_file}")

    print("\n" + "=" * 60)
    print("ANALYZING ENCODERS")
    print("=" * 60)

    for encoder_file in encoders:
        encoder_path = models_dir / encoder_file
        if encoder_path.exists():
            module = analyze_encoder(encoder_path)
            if module:
                modules_found.add(module)
        else:
            print(f"\n⚠️  Encoder not found: {encoder_file}")

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"📦 Modules found: {sorted(modules_found)}")

    # Generate recommended hidden imports
    print("\n" + "=" * 60)
    print("RECOMMENDED HIDDEN IMPORTS")
    print("=" * 60)

    recommended_imports = [
        # Core sklearn modules
        "sklearn",
        "sklearn.base",
        "sklearn.ensemble",
        "sklearn.ensemble._forest",
        "sklearn.ensemble._base",
        "sklearn.tree",
        "sklearn.tree._utils",
        "sklearn.tree._splitter",
        "sklearn.tree._criterion",
        "sklearn.utils",
        "sklearn.utils._cython_blas",
        "sklearn.utils._typedefs",
        "sklearn.utils._heap",
        "sklearn.utils._sorting",
        "sklearn.preprocessing",
        "sklearn.preprocessing._label",
        # Additional modules that might be needed
        "sklearn.neighbors",
        "sklearn.svm",
        "sklearn.linear_model",
        "sklearn.metrics",
        "sklearn.model_selection",
        # Cython extensions
        "sklearn._lib",
        "sklearn._lib.sklearn_utils",
        "sklearn._lib.sklearn_parallel",
    ]

    for imp in recommended_imports:
        print(f'      "--hidden-import {imp}",')

    print("\n" + "=" * 60)
    print("ANALYSIS COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()
