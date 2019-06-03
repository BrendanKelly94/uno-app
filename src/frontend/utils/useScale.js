import React, { useState, useEffect } from "react";

function useScale() {
  const [scaleFactor, setScaleFactor] = useState(getScale());

  function getScale() {
    if (window.innerWidth < 500) {
      return { x: 0.48, y: 0.48, size: 1 };
    } else if (window.innerWidth < 768) {
      return { x: 0.45, y: 0.45, size: 1.1 };
    } else if (window.innerWidth < 992) {
      return { x: 0.4, y: 0.4, size: 1.2 };
    } else {
      return { x: 0.4, y: 0.4, size: 1.5 };
    }
  }

  function handleResize() {
    const scale = getScale();
    if (scale.size !== scaleFactor.size) {
      setScaleFactor(scale);
    }
  }

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  return scaleFactor;
}

export default useScale;
