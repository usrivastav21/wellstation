import { useCallback, useEffect, useMemo, useState } from "react";

export const useCamera = () => {
  const [devices, setDevices] = useState([]);
  const [currentDevice, setCurrentDevice] = useState(null);
  const [stream, setStream] = useState(null);

  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);

      // Auto-select camera: prefer external USB camera over built-in
      let selectedDevice = null;

      // Auto-select external camera if available, otherwise use default
      if (videoDevices.length > 1) {
        // Look for external camera (usually not the first device)
        // External cameras often have different labels or are not the default
        const externalCamera = videoDevices.find(
          (device) =>
            device.label &&
            !device.label.toLowerCase().includes("built-in") &&
            !device.label.toLowerCase().includes("default") &&
            !device.label.toLowerCase().includes("front") &&
            !device.label.toLowerCase().includes("back")
        );

        if (externalCamera) {
          selectedDevice = externalCamera;
          console.log(
            `Auto-selected external camera: ${
              externalCamera.label || "External Camera"
            }`
          );
        } else {
          selectedDevice = videoDevices[0];
          console.log(
            `Using default camera: ${selectedDevice.label || "Default Camera"}`
          );
        }
      } else {
        selectedDevice = videoDevices[0];
        console.log(
          `Using only available camera: ${
            selectedDevice.label || "Default Camera"
          }`
        );
      }

      if (
        selectedDevice &&
        selectedDevice.deviceId !== currentDevice?.deviceId
      ) {
        setCurrentDevice(selectedDevice);
      }
    } catch (error) {
      console.error("Error getting camera devices:", error);
    }
  }, [currentDevice?.deviceId]);

  const startStream = useCallback(async (deviceId) => {
    try {
      const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: true, // Keep audio for recording
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      return newStream;
    } catch (error) {
      console.error("Error accessing camera:", error);
      throw error;
    }
  }, []);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    getDevices();
    return () => stopStream();
  }, [getDevices, stopStream]);

  const cameraData = useMemo(() => {
    return {
      devices,
      currentDevice,
      stream,
      setCurrentDevice,
      startStream,
      stopStream,
      getDevices,
    };
  }, [devices, currentDevice?.deviceId]);

  return cameraData;
};
