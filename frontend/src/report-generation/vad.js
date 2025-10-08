export default function vad(analyser, callback, options = {}) {
  const {
    silenceThreshold = 1, // Volume threshold for silence
    lowVolumeThreshold = 10, // Volume threshold for low volume
    checkInterval = 100, // Interval for checking volume (in ms)
    silenceDuration = 3000, // 3 seconds for silence
    lowVolumeDuration = 2000, // 2 seconds for low volume
  } = options;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  let lastSpeechTime = Date.now(); // Tracks the last time speech was detected
  let lastLowVolumeTime = Date.now(); // Tracks the last time low volume was detected
  let currentState = null; // Track the current state
  let timeoutId = null; // Track the timeout ID

  const detectSpeech = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    analyser.getByteFrequencyData(dataArray);

    // Compute the average volume (normalize by buffer size)
    const volume =
      dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
    console.log("<= volume", volume);

    const currentTime = Date.now();

    // Check for normal speech first
    if (volume >= lowVolumeThreshold) {
      if (currentState !== null) {
        callback("normal"); // Notify that speech is back to normal
        currentState = null;
      }
      lastSpeechTime = currentTime;
      lastLowVolumeTime = currentTime;
    }
    // Check for silence
    else if (volume <= silenceThreshold) {
      if (currentTime - lastSpeechTime >= silenceDuration) {
        if (currentState !== "silence") {
          callback("silence");
          currentState = "silence";
        }
      }
    }
    // Check for low volume
    else if (volume > silenceThreshold && volume < lowVolumeThreshold) {
      if (currentTime - lastLowVolumeTime >= lowVolumeDuration) {
        if (currentState !== "lowVolume") {
          callback("lowVolume");
          currentState = "lowVolume";
        }
      }
    }

    // Repeat the detection at a set interval
    timeoutId = setTimeout(detectSpeech, checkInterval);
  };

  detectSpeech();

  // Return cleanup function
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
}
