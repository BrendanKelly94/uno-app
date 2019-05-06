import React, { useRef, useEffect } from "react";
import ReactDOM from "react-dom";
function PlayerIndicator({ isMyTurn, scale }) {
  const circleRef = useRef(null);
  const size = 150 * scale;
  useEffect(
    () => {
      const element = ReactDOM.findDOMNode(circleRef.current);
      element.setAttribute(
        "stroke-dashoffset",
        isMyTurn ? 0 : size * (Math.PI * 2)
      );
      if (isMyTurn) {
        setTimeout(() => {
          element.setAttribute("fill", "url(#rgrad)");
        }, 500);
      } else {
        element.setAttribute("fill", "transparent");
      }
    },
    [isMyTurn]
  );

  return (
    <svg
      width={`${size}`}
      height={`${size}`}
      strokeWidth=".05em"
      stroke="#000"
      fill="transparent"
      strokeDasharray={`${size * (2 * Math.PI)}`}
      strokeDashoffset={`${size * (2 * Math.PI)}`}
      strokeLinecap="round"
      style={{
        transition: "stroke-dashoffset 1s ease",
        stroke: "#fff",
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%,-50%)",
        zIndex: isMyTurn ? 1 : 0
      }}
      ref={circleRef}
    >
      <defs>
        <radialGradient id="rgrad" cx="50%" cy="50%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#FFFFC7" stopOpacity="0">
            <animate
              attributeName="stop-opacity"
              values="1; 0; 1"
              dur="2s"
              repeatCount="indefinite"
            />
          </stop>
        </radialGradient>
      </defs>

      <circle cx="50%" cy="50%" r="45%" />
    </svg>
  );
}

export default PlayerIndicator;
