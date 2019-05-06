import React, { useRef, useEffect } from "react";
import Card from "./Card.js";

function ColorChanger({ changeColor, toggle, handRef }) {
  const colors = ["red", "blue", "green", "yellow"];
  const colorEnum = {
    red: "#FF4747",
    yellow: "#FFFF87",
    green: "#ACDB85",
    blue: "#84BAB7"
  };
  const containerRef = useRef(null);
  const containerStyle = {
    position: "absolute",
    padding: "1em",
    width: "50%",
    left: "50%",
    bottom: "3%",
    transform: "translate(-50%, 0)",
    display: toggle ? "flex" : "none",
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: "transparent",
    zIndex: 10
  };

  const selectionStyle = {
    zIndex: 10,
    width: "3em",
    height: "3em",
    borderRadius: "50%",
    border: "2px solid #fff"
  };

  function mouseEnter(e) {
    const color = e.target.id;
    e.target.style.boxShadow = `0 0 1em 1em ${color}`;
  }

  function mouseLeave(e) {
    e.target.style.boxShadow = "";
  }

  useEffect(
    () => {
      if (toggle) {
        handRef.current.style.filter = "blur(.2em)";
      } else {
        handRef.current.style.filter = "";
      }
    },
    [toggle]
  );

  return (
    <React.Fragment>
      <div style={containerStyle} ref={containerRef}>
        {colors.map(color => (
          <div
            key={color}
            id={color}
            onClick={() => changeColor(color)}
            onMouseEnter={mouseEnter}
            onMouseLeave={mouseLeave}
            style={{ ...selectionStyle, backgroundColor: colorEnum[color] }}
          />
        ))}
      </div>
    </React.Fragment>
  );
}

export default ColorChanger;
