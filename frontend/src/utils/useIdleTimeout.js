import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { removeAuthToken } from "../api-client";
import { stepAtom } from "../atoms";

const IDLE_TIMEOUT = 8 * 60 * 1000; // 8 minutes in milliseconds

export const useIdleTimeout = () => {
  const navigate = useNavigate();
  const setStep = useSetAtom(stepAtom);

  useEffect(() => {
    let idleTimer = null;

    const resetTimer = () => {
      if (idleTimer) {
        console.log("clearing timer");
        clearTimeout(idleTimer);
      }
      idleTimer = setTimeout(() => {
        handleIdleTimeout();
      }, IDLE_TIMEOUT);
    };

    const handleIdleTimeout = () => {
      removeAuthToken("user");
      navigate("/booth");
      setStep("welcome");
    };

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });

      if (idleTimer) {
        clearTimeout(idleTimer);
      }
    };
  }, [navigate]);
};
