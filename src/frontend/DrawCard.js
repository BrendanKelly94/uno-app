import React, { useEffect, useState } from 'react';
import Card from './Card';
import { TweenLite, TimelineLite, TimelineMax } from 'gsap';

const DrawCard = React.memo(({ tl, playerStatus, myId, scaleFactor, isMyTurn}) => {
  const [ isFirst, setIsFirst ] = useState(true);
  const range = [...Array(4)].map((_, i) => i);
  // const tl = new TimelineLite;

  useEffect(() => {
    if(!isFirst && playerStatus.isDrawing){
      console.log('drawing')
      const source = document.getElementById('draw-animate');
      const target = document.getElementById(`player-${playerStatus.id}-card-0`);
      const sBox = source.getBoundingClientRect();
      const tBox = target.getBoundingClientRect();

      const transform = {
        x: (myId === playerStatus.id)?tBox.right - sBox.right:tBox.x - sBox.x,
        y: tBox.y - sBox.y
      }

      tl
      .to(source, .5, {x: transform.x/scaleFactor, y: transform.y/scaleFactor, scale: .8})
      .to(source, .4, {opacity: 0}, '-=.4')
      .to(source, 0, {x: 0, y:0, scale: 1, opacity: 1})


    }else{
      setIsFirst(false);
    }
  }, [playerStatus]);


  return(
    <div style = {{display: 'flex'}}>
      <Card
        cId = 'draw-animate'
        style = {{
          position: 'absolute',
          zIndex: 0,
          marginRight: '10px'
        }}
      />
      {
        range.map(i =>
          <Card
           cId = {`draw-${i}`}
           style = {(i === 0)? {zIndex: 1, marginLeft: '0 !important'}: {zIndex: 1, marginLeft: '-48px'}}
          />
        )
      }
      <Card
        cId = 'draw-card'
        style = {{marginLeft: '-48px', zIndex: 2}}
      />
    </div>
  )
}, (oldP, newP) => {
  if(oldP.playerStatus.id === newP.playerStatus.id || newP.playerStatus.id === null){
    return true;
  }else{
    return false;
  }
})

export default DrawCard;
