import React from "react";

function LoadingSpinnerAnimation() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <svg
        width="64"
        height="64"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="spinnerGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#FCD4C5" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#F5703D" stopOpacity="1" />
          </linearGradient>
        </defs>

        <g
          style={{
            transformOrigin: "center",
            animation: "spin 1.5s linear infinite",
          }}
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="url(#spinnerGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="180 270"
          />
        </g>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </svg>
    </div>
  );
}

export default LoadingSpinnerAnimation;
