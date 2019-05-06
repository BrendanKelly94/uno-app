import React, { useEffect, useState, useRef } from "react";
import Card from "./Card";
import { TweenLite, TimelineLite, TimelineMax } from "gsap";

const DrawCard = React.memo(
  ({ tl, playerStatus, myId, scaleFactor, isMyTurn }) => {
    const [isFirst, setIsFirst] = useState(true);
    const [glowTl, setGlowTl] = useState(
      new TimelineMax({ paused: true, repeat: -1, yoyo: true })
    );
    const range = [...Array(4)].map((_, i) => i);
    const source = useRef(null);
    const glowSource = useRef(null);

    useEffect(
      () => {
        if (!isFirst && playerStatus.isDrawing) {
          const target = document.getElementById(
            `player-${playerStatus.id}-card-0`
          );
          const sBox = source.current.getBoundingClientRect();
          const tBox = target.getBoundingClientRect();

          const transform = {
            x:
              myId === playerStatus.id
                ? tBox.right - sBox.right
                : tBox.x - sBox.x,
            y: tBox.y - sBox.y
          };

          tl.to(source.current, 0.5, {
            x: transform.x / scaleFactor,
            y: transform.y / scaleFactor,
            scale: 0.8
          })
            .to(source.current, 0.2, { opacity: 0 }, "-=.4")
            .set(source.current, { x: 0, y: 0, scale: 1, opacity: 1 });
        } else {
          if (isFirst) {
            glowTl.to(glowSource.current, 1, { backgroundColor: "#87A399" });
            setIsFirst(false);
          }
        }
      },
      [playerStatus]
    );

    useEffect(
      () => {
        if (isMyTurn) {
          glowTl.restart();
          glowTl.play();
        } else {
          if (!isFirst) {
            glowTl.restart();
            glowTl.pause();
          }
        }
      },
      [isMyTurn]
    );

    return (
      <div style={{ display: "flex" }}>
        <Card
          cId="draw-animate"
          ref={source}
          style={{
            position: "absolute",
            zIndex: 0,
            marginRight: "10px"
          }}
        />
        {range.map(i => (
          <Card
            cId={`draw-${i}`}
            style={
              i === 0
                ? { zIndex: 1, marginLeft: "0 !important" }
                : { zIndex: 1, marginLeft: "-48px" }
            }
          />
        ))}
        <Card
          cId="draw-card"
          ref={glowSource}
          style={{ marginLeft: "-48px", zIndex: 2 }}
        />
      </div>
    );
  },
  (oldP, newP) => {}
);

export default DrawCard;
