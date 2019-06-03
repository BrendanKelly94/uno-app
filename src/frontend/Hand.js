import React, { useContext, useState, useEffect, useRef } from "react";
import { Scrollbars } from "react-custom-scrollbars";
import gameStoreContext from "./context/gameStoreContext";
import ApiEndpoint from "./utils/ApiEndpoint";
import HandCard from "./HandCard";
import ColorChanger from "./ColorChanger.js";
import Card from "./Card";
import gsap from "gsap";
import history from "./utils/history";

const Hand = React.memo(
  ({
    tl,
    myId,
    hand,
    isMyTurn,
    lastTurnId,
    scaleFactor,
    drawCard,
    submitCard,
    isAnimating,
    errorHandler
  }) => {
    const [options, setOptions] = useState([]);
    const [prevCount, setPrevCount] = useState(hand.length);
    const [hasDrawn, setHasDrawn] = useState({ status: false, card: null });
    const [colorChange, setColorChange] = useState({
      status: false,
      cardId: null
    });
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const handRef = useRef(null);

    const location = history.location.pathname.split("/");
    const gameId = location[location.length - 1];

    const containerStyle = {
      position: "absolute",
      left: "50%",
      bottom: "3%",
      transform: `translate(-50%, 0) scale(${scaleFactor})`,
      display: "flex",
      justifyContent: "center",
      transition: "all .5s ease",
      transition: "filter .5 ease"
    };

    const drawBoxStyle = {
      position: "absolute",
      width: "40%",
      height: `${70 * scaleFactor}px`,
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "transparent"
    };

    function handleOptionClick(e) {
      if (!isAnimating && isMyTurn && !hasDrawn.status && !hasSubmitted) {
        const eId = e.currentTarget.id;
        const cardId = parseInt(eId.split("-")[1], 10);
        const index = hand.findIndex(card => cardId === card.id);
        let isOption = false;
        for (let i = 0; i < options.length; i++) {
          if (options[i].id === cardId) {
            isOption = true;
            break;
          }
        }
        if (isOption && hand[index].color !== "black") {
          submitCardAction({ cardId: cardId });
          setHasSubmitted(true);
        } else {
          if (isOption) {
            setColorChange({ status: true, cardId: cardId });
            setHasSubmitted(true);
          }
        }
      }
    }

    async function handleDrawClick() {
      errorHandler(async () => {
        if (
          isMyTurn &&
          !isAnimating &&
          !hasDrawn.status &&
          !colorChange.status &&
          !hasSubmitted
        ) {
          setHasSubmitted(true);
          const card = await drawCard();
          tl.to(".hand-card", 0.5, {
            onComplete: () => {
              setHasDrawn({ status: true, card: card });
            }
          });
        }
      })();
    }

    function handleColorChange(color) {
      submitCardAction({
        cardId: colorChange.cardId,
        color: color,
        hasDrawn: hasDrawn.status
      });
      setColorChange({ status: false, cardId: null });
    }

    function submitCardAction({ cardId, color, hasDrawn }) {
      if (cardId !== -1 && (isMyTurn && myId !== null)) {
        const cI = hand.findIndex(card => card.id === cardId);
        const source = document.getElementById(`hand-${cardId}`);
        const target = document.getElementById("card-in-play");
        const sBox = source.getBoundingClientRect();
        const tBox = target.getBoundingClientRect();
        const translate = {
          x: tBox.x - sBox.x,
          y: tBox.y - sBox.y
        };
        const variance = Math.random() * (5 - -5) + -5;

        tl.to(source, 0.5, {
          x: translate.x / scaleFactor,
          y: translate.y / scaleFactor,
          rotation: variance,
          scale: 1.2,
          onComplete: () => {
            submitCard({ cId: cardId, color: color, hasDrawn });
            setOptions([]);
            setHasDrawn({ status: false, card: null });
            setHasSubmitted(false);
          }
        });
      } else {
        submitCard({ cId: cardId, hasDrawn: true });
        setOptions([]);
        setHasDrawn({ status: false, card: null });
        setHasSubmitted(false);
      }
    }

    async function isMyTurnUpdate() {
      errorHandler(async () => {
        if (isMyTurn && myId !== null) {
          const optionsData = await new ApiEndpoint(
            `/api/game/${gameId}/getHandOptions/${myId}`
          ).getReq();
          let selector = optionsData.options.reduce((acc, cur) => {
            return (acc += `#hand-${cur.id}, `);
          }, "");
          selector = selector.substring(0, selector.length - 2);
          if (selector.length > 0) {
            tl.to(selector, 0.5, { yPercent: -50 });
          }
          setOptions(optionsData.options);
        }
      })();
    }

    async function hasDrawnUpdate() {
      errorHandler(async () => {
        if (hasDrawn.status) {
          const optionsData = await new ApiEndpoint(
            `/api/game/${gameId}/getHandOptions/${myId}`
          ).getReq();
          const os = optionsData.options;

          if (os.length > options.length) {
            const drawIndex = os.findIndex(
              card => card.id === hasDrawn.card.id
            );
            if (os[drawIndex].value === 13 || os[drawIndex].value === 14) {
              setColorChange({ status: true, cardId: os[drawIndex].id });
            } else {
              submitCardAction({ cardId: os[drawIndex].id, hasDrawn: true });
            }
          } else {
            submitCardAction({ cardId: -1 });
          }
        }
      })();
    }

    useEffect(
      () => {
        isMyTurnUpdate();
      },
      [isMyTurn]
    );

    useEffect(
      () => {
        hasDrawnUpdate();
      },
      [hasDrawn]
    );

    useEffect(
      () => {
        tl.to(".hand-card", 0.5, { yPercent: 0 });
      },
      [hand]
    );

    return (
      <React.Fragment>
        <Scrollbars>
          <div
            id={`player-${myId}-card-0`}
            style={containerStyle}
            ref={handRef}
          >
            {hand.map((item, i) => (
              <HandCard
                key={"hand-" + item.id}
                color={item.color}
                value={item.value}
                cId={`hand-${item.id}`}
                cClass={"hand-card"}
                style={{
                  transformOrigin: "top left"
                }}
                submitCard={handleOptionClick}
              />
            ))}
          </div>
        </Scrollbars>
        <div style={drawBoxStyle} onClick={handleDrawClick} />
        <ColorChanger
          changeColor={handleColorChange}
          toggle={colorChange.status}
          handRef={handRef}
        />
      </React.Fragment>
    );
  },
  (oldP, newP) => {
    if (
      oldP.hand.length === newP.hand.length &&
      oldP.isMyTurn === newP.isMyTurn
    ) {
      return true;
    } else {
      return false;
    }
  }
);

export default Hand;
