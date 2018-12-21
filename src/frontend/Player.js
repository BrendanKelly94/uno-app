import React, { useEffect } from 'react';
import { TweenLite, TimelineLite } from 'gsap';
import Card from './Card'

const Player = React.memo(({ pId, cardCount, isAnimating, translate, rotate, scale }) => {
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    position: 'absolute',
    width: '10em',
    left: `calc(50% - 5em)`,
    top: `calc(50% - 3.563em)`,
    transform: `translate(${translate.x}px, ${translate.y}px)rotate(${rotate}deg)scale(${scale})`
  }
  const tl = new TimelineLite;

  useEffect(() => {
    if(isAnimating){
      const topCard = document.getElementById(`player-${pId}-card-0`);
      tl.to(topCard, .5, {rotationY: 180});
    }
  }, [isAnimating])

  const print = () => {
    console.log('render')
  }
  const range = [...Array(cardCount)].map((_, i) => i);
  return(
    <div style = {containerStyle}>
      {
        range.map(i =>
          <Card cId = {`player-${pId}-card-${(cardCount - 1) - i}`} style = {(i === 0)?{ marginLeft: '0 !important'}:{ marginLeft: '-45px'}}/>
        )
      }
    </div>
    //chat bubble will go here
  );
}, (oldP, newP) => {
  //deep comparison for desired optimization
  if(oldP.cardCount !== newP.cardCount){
    return false;
  }else if(oldP.isAnimating !== newP.isAnimating){
    return false;
  }else if(oldP.scale !== newP.scale){
    return false;
  }else if(oldP.translate !== newP.translate){
    return false;
  }else{
    return true;
  }
})

export default Player;
