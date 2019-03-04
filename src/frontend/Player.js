import React, { useState, useEffect } from 'react';
import { TweenLite, TimelineLite } from 'gsap';
import ApiEndpoint from './utils/ApiEndpoint.js';
import Card from './Card'

const Player = ({ tl, pId, playerStatus, translate, rotate, scale, turnId }) => {
  const [ cardCount, setCardCount ] = useState(7);
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    position: 'absolute',
    width: '10em',
    left: `calc(50% - 5em)`,
    top: `calc(50% - 3.563em)`,
    transform: `translate(${translate.x}px, ${translate.y}px)rotate(${rotate}deg)scale(${scale})`
  }
  const indicatorStyle = {
    width: '1em',
    heigh: '1em',
    borderRadius: '50%',
    backgroundColor: '#000',
    position: 'absolute',
    top: '120%',
    left: '50%',
    transform: 'translate(-50%,0)'
  }
  // const tl = new TimelineLite;

  useEffect(async () => {
    try{
      if(pId === playerStatus.id && playerStatus.isAnimating && !playerStatus.isDrawing){
        const topCard = document.getElementById(`player-${pId}-card-0`);
        tl.to(topCard, .5, {rotationY: 180,
            onComplete: async () => {
                const data = await new ApiEndpoint(`http://localhost:3000/api/getPlayerHandCount/${pId}`).getReq();
                setCardCount(data.count);
            }
        });
      }else if(pId === playerStatus.id && (playerStatus.isDrawing || !playerStatus.isAnimating)){
        const data = await new ApiEndpoint(`http://localhost:3000/api/getPlayerHandCount/${pId}`).getReq();
        setCardCount(data.count);
      }
    }catch(e){
      console.log(e);
    }


  }, [playerStatus])


  const range = [...Array(cardCount)].map((_, i) => i);
  return(
    <div style = {containerStyle}>
      {
        range.map(i =>
          <Card cId = {`player-${pId}-card-${(cardCount - 1) - i}`} style = {(i === 0)?{ marginLeft: '0 !important'}:{ marginLeft: '-45px'}}/>
        )
      }
      {
        (turnId === pId)?
        <div style = {indicatorStyle}>
        </div>
        :null
      }
    </div>
    //chat bubble will go here
  );
}

export default Player;
