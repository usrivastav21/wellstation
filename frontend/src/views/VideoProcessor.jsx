// VideoProcessor.jsx
import { useCallback, useEffect, useRef, useState, use } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Stack,
  Text,
  VStack,
  useToast,
  Select,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  IconButton,
} from "@chakra-ui/react";
import { FaCamera, FaSync, FaPlay, FaStop, FaSave } from "react-icons/fa";

// Custom hook for camera management
const useCamera = () => {
  const [devices, setDevices] = useState([]);
  const [currentDevice, setCurrentDevice] = useState(null);
  const [stream, setStream] = useState(null);
  const toast = useToast();

  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !currentDevice) {
        setCurrentDevice(videoDevices[0]);
      }
    } catch (error) {
      toast({
        title: "Error getting camera devices",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [currentDevice, toast]);

  const startStream = useCallback(
    async (deviceId) => {
      try {
        const constraints = {
          video: deviceId ? { deviceId: { exact: deviceId } } : true,
        };
        const newStream = await navigator.mediaDevices.getUserMedia(
          constraints
        );
        setStream(newStream);
        return newStream;
      } catch (error) {
        toast({
          title: "Error accessing camera",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [toast]
  );

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

  return {
    devices,
    currentDevice,
    stream,
    setCurrentDevice,
    startStream,
    stopStream,
  };
};

// Custom hook for video processing
const useVideoProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [filter, setFilter] = useState("none");
  const [metrics, setMetrics] = useState({
    fps: 0,
    framesProcessed: 0,
    processingTime: 0,
    startTime: null,
  });
  const frameRef = useRef(0);
  const processingRef = useRef(false);

  const processFrame = useCallback((videoEl, canvasEl, filter) => {
    if (!processingRef.current) return;

    const ctx = canvasEl.getContext("2d");
    ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

    // Apply selected filter
    const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);

    switch (filter) {
      case "grayscale":
        applyGrayscaleFilter(imageData);
        break;
      case "blur":
        applyBlurFilter(imageData);
        break;
      case "edge":
        applyEdgeFilter(imageData);
        break;
      case "threshold":
        applyThresholdFilter(imageData);
        break;
    }

    ctx.putImageData(imageData, 0, 0);

    // Update metrics
    const now = performance.now();
    setMetrics((prev) => {
      const newFramesProcessed = prev.framesProcessed + 1;
      const elapsedTime = now - (prev.startTime || now);
      const fps = newFramesProcessed / (elapsedTime / 1000);
      const processingTime = elapsedTime / newFramesProcessed;

      return {
        fps,
        framesProcessed: newFramesProcessed,
        processingTime,
        startTime: prev.startTime || now,
      };
    });

    frameRef.current = requestAnimationFrame(() =>
      processFrame(videoEl, canvasEl, filter)
    );
  }, []);

  const startProcessing = useCallback(
    (videoEl, canvasEl) => {
      processingRef.current = true;
      setIsProcessing(true);
      setMetrics((prev) => ({ ...prev, startTime: performance.now() }));
      processFrame(videoEl, canvasEl, filter);
    },
    [filter, processFrame]
  );

  const stopProcessing = useCallback(() => {
    processingRef.current = false;
    setIsProcessing(false);
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
  }, []);

  return {
    isProcessing,
    filter,
    metrics,
    setFilter,
    startProcessing,
    stopProcessing,
  };
};

// Filter implementations
const applyGrayscaleFilter = (imageData) => {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = data[i + 1] = data[i + 2] = avg;
  }
};

const applyBlurFilter = (imageData) => {
  // Implement Gaussian blur
  // This is a simplified version - you might want to implement a more sophisticated blur
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // Create temporary array for the blur operation
  const temp = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        const i = (y * width + x) * 4 + c;
        data[i] =
          (temp[i - width * 4 - 4] +
            temp[i - width * 4] +
            temp[i - width * 4 + 4] +
            temp[i - 4] +
            temp[i] +
            temp[i + 4] +
            temp[i + width * 4 - 4] +
            temp[i + width * 4] +
            temp[i + width * 4 + 4]) /
          9;
      }
    }
  }
};

const applyEdgeFilter = (imageData) => {
  // Implement Sobel edge detection
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const temp = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;

      // Compute gradient
      const gx =
        -temp[i - width * 4 - 4] +
        temp[i - width * 4 + 4] +
        -2 * temp[i - 4] +
        2 * temp[i + 4] +
        -temp[i + width * 4 - 4] +
        temp[i + width * 4 + 4];

      const gy =
        -temp[i - width * 4 - 4] -
        2 * temp[i - width * 4] -
        temp[i - width * 4 + 4] +
        temp[i + width * 4 - 4] +
        2 * temp[i + width * 4] +
        temp[i + width * 4 + 4];

      const magnitude = Math.sqrt(gx * gx + gy * gy);
      data[i] = data[i + 1] = data[i + 2] = magnitude > 128 ? 255 : 0;
    }
  }
};

const applyThresholdFilter = (imageData) => {
  const data = imageData.data;
  const threshold = 128;

  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const value = avg > threshold ? 255 : 0;
    data[i] = data[i + 1] = data[i + 2] = value;
  }
};

// Main component
const VideoProcessor = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const toast = useToast();

  const {
    devices,
    currentDevice,
    stream,
    setCurrentDevice,
    startStream,
    stopStream,
  } = useCamera();

  const {
    isProcessing,
    filter,
    metrics,
    setFilter,
    startProcessing,
    stopProcessing,
  } = useVideoProcessing();

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleStartCamera = async () => {
    const newStream = await startStream(currentDevice?.deviceId);
    if (newStream && videoRef.current) {
      videoRef.current.srcObject = newStream;
    }
  };

  const handleSwitchCamera = async () => {
    stopStream();
    const nextDevice =
      devices[(devices.indexOf(currentDevice) + 1) % devices.length];
    setCurrentDevice(nextDevice);
    await startStream(nextDevice.deviceId);
  };

  const handleStartProcessing = () => {
    if (!stream) {
      toast({
        title: "Error",
        description: "Please start the camera first",
        status: "error",
        duration: 3000,
      });
      return;
    }
    startProcessing(videoRef.current, canvasRef.current);
  };

  const handleSaveOutput = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "processed-video.png";
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <Card maxW="4xl" mx="auto" mt={8}>
      <CardBody>
        <VStack spacing={6}>
          <Box position="relative" w="100%" aspectRatio={16 / 9}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "md",
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderRadius: "md",
              }}
            />
          </Box>

          <Stack direction={["column", "row"]} spacing={4} w="100%">
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              w={["100%", "200px"]}
            >
              <option value="none">No Filter</option>
              <option value="grayscale">Grayscale</option>
              <option value="blur">Blur</option>
              <option value="edge">Edge Detection</option>
              <option value="threshold">Threshold</option>
            </Select>

            <Button
              leftIcon={<FaCamera />}
              onClick={handleStartCamera}
              isDisabled={isProcessing}
              colorScheme="blue"
            >
              Start Camera
            </Button>

            <Button
              leftIcon={<FaSync />}
              onClick={handleSwitchCamera}
              isDisabled={!stream || isProcessing || devices.length < 2}
              colorScheme="teal"
            >
              Switch Camera
            </Button>

            <Button
              leftIcon={isProcessing ? <FaStop /> : <FaPlay />}
              onClick={isProcessing ? stopProcessing : handleStartProcessing}
              isDisabled={!stream}
              colorScheme={isProcessing ? "red" : "green"}
            >
              {isProcessing ? "Stop" : "Start"} Processing
            </Button>

            <Button
              leftIcon={<FaSave />}
              onClick={handleSaveOutput}
              isDisabled={!isProcessing}
              colorScheme="purple"
            >
              Save Output
            </Button>
          </Stack>

          <StatGroup w="100%">
            <Stat>
              <StatLabel>FPS</StatLabel>
              <StatNumber>{metrics.fps.toFixed(1)}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Frames Processed</StatLabel>
              <StatNumber>{metrics.framesProcessed}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Processing Time</StatLabel>
              <StatNumber>{metrics.processingTime.toFixed(1)}ms</StatNumber>
            </Stat>
          </StatGroup>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default VideoProcessor;
