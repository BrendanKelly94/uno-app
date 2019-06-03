import React from "react";
import { jsx, css, keyframes } from "@emotion/core";

const Card = React.forwardRef(({ cId, style, callback }, ref) => {
  const cardStyle = {
    width: "50px",
    height: "70px",
    boxSizing: "border-box",
    border: "1px #000 solid",
    borderRadius: "5px",
    backgroundColor: "#D3FFEF"
  };
  return (
    <div
      id={cId ? cId : ""}
      ref={ref}
      onClick={callback ? callback : () => true}
      style={style ? { ...cardStyle, ...style } : cardStyle}
    />
  );
});

export default Card;
