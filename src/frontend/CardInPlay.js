import React, {
  Fragment,
  useContext,
  useRef,
  useEffect,
  useState
} from "react";
import gameStoreContext from "./context/gameStoreContext";
import HandCard from "./HandCard";
import FindInitTransform from "./utils/FindInitTransform";

function CardInPlay({ card }) {
  const [backgroundCards, setBackgroundCards] = useState([]);
  const [lastVar, setLastVar] = useState(0);
  const [isFirst, setIsFirst] = useState(true);
  const containerStyle = {
    width: "50px"
  };

  const colorEnum = {
    red: "#FF4747",
    yellow: "#FFFF87",
    green: "#ACDB85",
    blue: "#84BAB7"
  };

  //add new card to background with corresponding variance
  useEffect(
    () => {
      if (!isFirst) {
        const temp = backgroundCards.slice();
        if (temp.length > 2) {
          temp.shift();
          temp.push(lastVar);
        } else {
          temp.push(lastVar);
        }
        setBackgroundCards(temp);
        setLastVar(card.variance);
      } else {
        setIsFirst(false);
      }
    },
    [card]
  );

  return (
    <Fragment>
      <div style={containerStyle}>
        {backgroundCards.map(v => (
          <HandCard
            id=""
            value={null}
            color="#ffffff"
            style={{
              position: "absolute",
              transform: `rotate(${v}deg)`
            }}
            isNew={false}
          />
        ))}
        <HandCard
          cId="card-in-play"
          value={card.value}
          color={card.color}
          style={{
            position: "absolute",
            transform: `rotate(${card.variance}deg)`
          }}
          isNew={false}
        />
      </div>
    </Fragment>
  );
}

export default CardInPlay;
