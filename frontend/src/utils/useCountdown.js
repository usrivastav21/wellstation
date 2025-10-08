import { useState, useCallback } from "react";
import { useInterval } from "@mantine/hooks";

export const useCountdown = (initialSeconds = 30, actions = {}) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  const {
    onComplete,
    onTick,
    onStart,
    onPause,
    onReset,
    autoStart = false,
  } = actions;

  const {
    start: startInterval,
    stop: stopInterval,
    toggle,
    active,
  } = useInterval(
    () => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;

        onTick?.(newTime);

        if (newTime <= 0) {
          onComplete?.();
          return 0;
        }

        return newTime;
      });
    },
    1000,
    { autoInvoke: autoStart }
  );

  const start = useCallback(() => {
    startInterval();
    onStart?.();
  }, [onStart, startInterval]);

  const pause = useCallback(() => {
    toggle();
    onPause?.();
  }, [onPause, toggle]);

  const reset = useCallback(
    (newSeconds = initialSeconds) => {
      setTimeLeft(newSeconds);
      onReset?.(newSeconds);
    },
    [initialSeconds, onReset]
  );

  const stop = useCallback(() => {
    stopInterval();
    setTimeLeft(0);
  }, [stopInterval]);

  return {
    timeLeft,
    isActive: active,
    start,
    pause,
    reset,
    stop,

    isComplete: timeLeft <= 0,
    progress: ((initialSeconds - timeLeft) / initialSeconds) * 100,
  };
};
