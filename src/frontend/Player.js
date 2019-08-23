import React, { useState, useEffect, useRef } from "react";
import { TweenLite, TimelineLite } from "gsap";
import ApiEndpoint from "./utils/ApiEndpoint.js";
import Card from "./Card";
import PlayerIndicator from "./PlayerIndicator.js";
import ChatBubble from "./ChatBubble.js";

const Player = React.memo(
  ({
    tl,
    pId,
    uName,
    playerStatus,
    translate,
    rotate,
    scale,
    turnId,
    currentMessage,
    errorHandler
  }) => {
    const [cardCount, setCardCount] = useState(7);
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [bubbleToggle, setBubbleToggle] = useState(false);
    const bubble = useRef(null);
    const topCard = useRef(null);

    const containerStyle = {
      display: "flex",
      justifyContent: "center",
      position: "absolute",
      width: "7em",
      left: `calc(50% - 5em)`,
      top: `calc(50% - 3.563em)`,
      transform: `translate(${translate.x}px, ${
        translate.y
      }px)rotate(${rotate}deg)scale(${scale})`,
      backgroundColor: "transparent",
      zIndex: isMyTurn ? 1 : 0
    };

    const nameStyle = {
      position: "absolute",
      backgroundColor: "#000",
      color: "#fff",
      fontSize: "1em",
      fontFamily: `Quicksand, sans-serif`,
      paddingLeft: "5%",
      paddingRight: "5%",
      top: "120%",
      left: "50%",
      transform: `translate(-50%, 0) rotate(${-rotate}deg)`,
      zIndex: "100"
    };

    async function updatePlayerState() {
      errorHandler(async () => {
        if (
          pId === playerStatus.id &&
          playerStatus.isAnimating &&
          !playerStatus.isDrawing
        ) {
          tl.set(topCard.current, { rotationY: 0 }).to(topCard.current, 0.5, {
            rotationY: 180,
            onComplete: async () => {
              const data = await new ApiEndpoint(
                `/api/getPlayerHandCount/${pId}`
              ).getReq();
              setCardCount(data.count);
            }
          });
        } else if (
          pId === playerStatus.id &&
          (!playerStatus.isDrawing && !playerStatus.isAnimating)
        ) {
          const data = await new ApiEndpoint(
            `/api/getPlayerHandCount/${pId}`
          ).getReq();
          setCardCount(data.count);
        } else if (pId === playerStatus.id && playerStatus.isDrawing) {
          tl.to(topCard.current, 0.5, {
            onComplete: async () => {
              const data = await new ApiEndpoint(
                `/api/getPlayerHandCount/${pId}`
              ).getReq();
              setCardCount(data.count);
            }
          });
        }
      })();

    }

    useEffect(
      () => {
        updatePlayerState();
      },
      [playerStatus]
    );

    useEffect(
      () => {
        if (turnId === pId) {
          setIsMyTurn(true);
        } else {
          if (isMyTurn) {
            setIsMyTurn(false);
          }
        }
      },
      [turnId]
    );

    useEffect(
      () => {
        if (currentMessage.userName === uName) {
          bubble.current.style.opacity = "1";
          setTimeout(() => {
            bubble.current.style.opacity = "0";
          }, 2000);
        }
      },
      [currentMessage]
    );

    const range = [...Array(cardCount)].map((_, i) => i);
    return (
      <React.Fragment>
        <div style={containerStyle}>
          <PlayerIndicator isMyTurn={isMyTurn} scale={scale} pId = {pId}/>
          <div id={`player-${pId}-name`} style={nameStyle}>
            {uName}
          </div>
          <ChatBubble
            ref={bubble}
            message={currentMessage.message}
            rotate={rotate}
          />
          {range.map(i => {
            if (cardCount - 1 - i === 0) {
              return (
                <Card
                  cId={`player-${pId}-card-${cardCount - 1 - i}`}
                  ref={topCard}
                  style={
                    i === 0
                      ? { zIndex: `${i}`, marginLeft: "0 !important" }
                      : { zIndex: `${i}`, marginLeft: "-45px" }
                  }
                />
              );
            } else {
              return (
                <Card
                  cId={`player-${pId}-card-${cardCount - 1 - i}`}
                  style={
                    i === 0
                      ? { zIndex: `${i}`, marginLeft: "0 !important" }
                      : { zIndex: `${i}`, marginLeft: "-45px" }
                  }
                />
              );
            }
          })}
        </div>
      </React.Fragment>
    );
  },
  (oldP, newP) => {
    if (
      oldP.scale !== newP.scale ||
      oldP.turnId === newP.pId ||
      newP.turnId === newP.pId ||
      newP.playerStatus.id === newP.pId ||
      oldP.currentMessage !== newP.currentMessage
    ) {
      return false;
    } else {
      return true;
    }
  }
);

export default Player;
