import React, { useState, useEffect, useRef } from 'react';
import { TweenLite, TimelineLite } from 'gsap';
import ApiEndpoint from './utils/ApiEndpoint.js';
import Card from './Card'
import PlayerIndicator from './PlayerIndicator.js'
import ChatBubble from './ChatBubble.js'

const Player = React.memo(({ tl, pId, uName, playerStatus, translate, rotate, scale, turnId, currentMessage }) => {
  const [ cardCount, setCardCount ] = useState(7);
  const [ isMyTurn, setIsMyTurn ] = useState(false);
  const [ bubbleToggle, setBubbleToggle ] = useState(false);
  const bubble = useRef(null);
  const topCard = useRef(null);

  const containerStyle= {
    display: 'flex',
    justifyContent: 'center',
    position: 'absolute',
    width: '7em',
    left: `calc(50% - 5em)`,
    top: `calc(50% - 3.563em)`,
    transform: `translate(${translate.x}px, ${translate.y}px)rotate(${rotate}deg)scale(${scale})`,
    backgroundColor: '#fff',
    transition: 'all .5s ease',
    zIndex: isMyTurn? 1:0
  }

  const nameStyle = {
    position: 'absolute',
    backgroundColor: '#000',
    color: '#fff',
    fontSize: '1em',
    paddingLeft: '5%',
    paddingRight: '5%',
    top: '120%',
    left: '50%',
    transform: `translate(-50%, 0) rotate(${-rotate}deg)`,
    zIndex: '100'
  }

  async function updatePlayerState(){
    try{
      if(pId === playerStatus.id && playerStatus.isAnimating && !playerStatus.isDrawing){
        tl
        .set(topCard.current, {rotationY: 0})
        .to(topCard.current, .5, {rotationY: 180,
            onComplete: async () => {
              const data = await new ApiEndpoint(`/api/getPlayerHandCount/${pId}`).getReq();
              setCardCount(data.count);
            }
        });

      }else if(pId === playerStatus.id && (!playerStatus.isDrawing && !playerStatus.isAnimating)){
        const data = await new ApiEndpoint(`/api/getPlayerHandCount/${pId}`).getReq();
        setCardCount(data.count);
      }else if(pId === playerStatus.id && playerStatus.isDrawing){
        tl
        .to(topCard.current, .5, {
          onComplete: async () => {
            const data = await new ApiEndpoint(`/api/getPlayerHandCount/${pId}`).getReq();
            setCardCount(data.count);
          }
        })
      }
    }catch(e){
      console.log(e);
    }
  }

  useEffect(() => {
    updatePlayerState();
  }, [playerStatus])

  useEffect(() => {
    if(turnId === pId){
      setIsMyTurn(true);
    }else{
      if(isMyTurn){
        setIsMyTurn(false);
      }
    }
  }, [turnId])

  useEffect(() => {
    if(currentMessage.userName === uName ){
      bubble.current.style.opacity = "1"
      setTimeout(() => {
        bubble.current.style.opacity = "0"
      },2000)
    }
  }, [currentMessage])


  const range = [...Array(cardCount)].map((_, i) => i);
  return(
    <React.Fragment>
      <div style = {containerStyle}>
        <PlayerIndicator isMyTurn = {isMyTurn} scale = {scale} />
        <div id = {`player-${pId}-name`} style = {nameStyle} >{uName}</div>
        <ChatBubble ref = {bubble} message = {currentMessage.message} rotate = {rotate}/>
        {
          range.map(i =>{
            if(((cardCount - 1) - i) === 0){
              return <Card cId = {`player-${pId}-card-${(cardCount - 1) - i}`} ref = {topCard} style = {(i === 0)?{ zIndex: `${i}`, marginLeft: '0 !important'}:{ zIndex: `${i}`, marginLeft: '-45px'}}/>
            }else{
              return <Card cId = {`player-${pId}-card-${(cardCount - 1) - i}`} style = {(i === 0)?{ zIndex: `${i}`, marginLeft: '0 !important'}:{ zIndex: `${i}`, marginLeft: '-45px'}}/>
            }
          })
        }
      </div>

    </React.Fragment>
  );
}, (oldP, newP) => {

})

export default Player;
