import React, { useEffect, useState, useRef } from 'react';
import Card from './Card';
import { TweenLite, TimelineLite, TimelineMax } from 'gsap';
import anime from 'animejs';

const DrawCard = React.memo(({ tl, playerStatus, myId, scaleFactor, isMyTurn}) => {
  const [ isFirst, setIsFirst ] = useState(true);
  const range = [...Array(4)].map((_, i) => i);
  const source = useRef(null);

  // let glowTl = new TimelineMax({paused:true, repeat: -1, yoyo: true});


  useEffect(() => {
    if(!isFirst && playerStatus.isDrawing){
      const target = document.getElementById(`player-${playerStatus.id}-card-0`);
      const sBox = source.current.getBoundingClientRect();
      const tBox = target.getBoundingClientRect();

      const transform = {
        x: (myId === playerStatus.id)?tBox.right - sBox.right:tBox.x - sBox.x,
        y: tBox.y - sBox.y
      }

      tl
      .to(source.current, .5, {x: transform.x/scaleFactor, y: transform.y/scaleFactor, scale: .8})
      .to(source.current, .4, {opacity: 0}, '-=.4')
      .set(source.current, {x: 0, y:0, scale: 1, opacity: 1})



    }else{

      // glowTl
      // .to(source.current, 1, {backgroundColor: '#b2bfff'})

      setIsFirst(false);
    }
  }, [playerStatus]);

  // useEffect(() => {
  //   if(!isFirst){
  //     if(isMyTurn){
  //       console.log('play')
  //       glowTl.play();
  //     }else{
  //       console.log('pause')
  //       glowTl.pause();
  //     }
  //   }
  // }, [isMyTurn])


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
        ref = {source}
        style = {{marginLeft: '-48px', zIndex: 2}}
      />
    </div>
  )
}, (oldP, newP) => {
  if((oldP.playerStatus.id === newP.playerStatus.id)|| newP.playerStatus.id === null){
    return true;
  }else{
    return false;
  }
})

export default DrawCard;
