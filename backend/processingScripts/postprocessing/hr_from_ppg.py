"""
referencce - https://github.com/ubicomplab/rPPG-Toolbox/blob/main/evaluation/post_process.py
"""

# Imports
from copy import deepcopy

import numpy as np
import scipy
import scipy.io
from scipy.signal import butter
from scipy.sparse import spdiags


# Helper Functions
def _next_power_of_2(x):
    """Calculate the nearest power of 2."""
    return 1 if x == 0 else 2 ** (x - 1).bit_length()

def _detrend(input_signal, lambda_value):
    """Detrend PPG signal."""
    signal_length = input_signal.shape[0]
    # observation matrix
    H = np.identity(signal_length)
    ones = np.ones(signal_length)
    minus_twos = -2 * np.ones(signal_length)
    diags_data = np.array([ones, minus_twos, ones])
    diags_index = np.array([0, 1, 2])
    D = spdiags(diags_data, diags_index,
                (signal_length - 2), signal_length).toarray()
    detrended_signal = np.dot(
        (H - np.linalg.inv(H + (lambda_value ** 2) * np.dot(D.T, D))), input_signal)
    return detrended_signal

def power2db(mag):
    """Convert power to db."""
    return 10 * np.log10(mag)


# HR Calculation algorithms
def _calculate_fft_hr(ppg_signal, fs=60, low_pass=0.75, high_pass=2.5):
    """Calculate heart rate based on PPG using Fast Fourier transform (FFT)."""
    ppg_signal = np.expand_dims(ppg_signal, 0)
    N = _next_power_of_2(ppg_signal.shape[1])
    f_ppg, pxx_ppg = scipy.signal.periodogram(ppg_signal, fs=fs, nfft=N, detrend=False)
    fmask_ppg = np.argwhere((f_ppg >= low_pass) & (f_ppg <= high_pass))
    mask_ppg = np.take(f_ppg, fmask_ppg)
    mask_pxx = np.take(pxx_ppg, fmask_ppg)
    fft_hr = np.take(mask_ppg, np.argmax(mask_pxx, 0))[0] * 60
    return fft_hr

def _calculate_peak_hr(ppg_signal, fs):
    """Calculate heart rate based on PPG using peak detection."""
    ppg_peaks, _ = scipy.signal.find_peaks(ppg_signal)
    hr_peak = 60 / (np.mean(np.diff(ppg_peaks)) / fs)
    return hr_peak


# Function to calculate HR
def calculate_hr(ppg_signal, fs=30, hr_method="FFT"):
    """Calculate HR from ppg_signal."""
    ppg_signal = _detrend(np.cumsum(ppg_signal), 100)
    [b, a] = butter(1, [0.75 / fs * 2, 2.5 / fs * 2], btype='bandpass')
    ppg_signal = scipy.signal.filtfilt(b, a, np.double(ppg_signal))
    
    if hr_method == "FFT":
        hr = _calculate_fft_hr(ppg_signal, fs=fs)
    elif hr_method == "Peak":
        hr = _calculate_peak_hr(ppg_signal, fs=fs)
    else:
        raise ValueError('Please use FFT or Peak to calculate your HR.')
    
    return hr