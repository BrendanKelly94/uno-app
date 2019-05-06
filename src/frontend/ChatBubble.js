import React from "react";

const ChatBubble = React.forwardRef(({ message, rotate }, ref) => {
  const side = rotate > 0 ? "start" : "end";
  const rectStyle = {
    height: "fit-content",
    width: "fit-content",
    backgroundColor: "darkgrey",
    color: "#fff",
    padding: ".25em 1em .25em 1em",
    flexWrap: "wrap",
    maxWidth: "10em"
  };

  const svgStyle = {
    alignSelf: `${rotate > 0 ? "flex-end" : "flex-start"}`,
    transform: `${rotate > 0 ? "rotate(-90deg)" : ""}`
  };

  const leftContainerStyle = {
    position: "absolute",
    transform: `rotate(${-rotate}deg)`,
    top: "150%",
    left: "60%",
    width: "fit-content",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    transition: "all .5s ease",
    opacity: 0
  };

  const rightContainerStyle = {
    position: "absolute",
    transform: `rotate(${-rotate}deg)`,
    top: "150%",
    right: "60%",
    width: "fit-content",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    transition: "all .5s ease",
    opacity: 0
  };

  return (
    <div
      style={side === "start" ? leftContainerStyle : rightContainerStyle}
      ref={ref}
    >
      <svg width="10" height="10" style={svgStyle} fill="darkgrey">
        <path d="M0 0 L0 10 L10 10 Z" />
      </svg>
      <div style={rectStyle}>{message}</div>
    </div>
  );
});

export default ChatBubble;
