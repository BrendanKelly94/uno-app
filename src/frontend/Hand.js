import React, { useContext, useState, useEffect } from 'react';
import gameStoreContext from './context/gameStoreContext';
import HandCard from './HandCard';
import gsap from 'gsap';

const Hand = React.memo(({ hand, isMyTurn, lastTurnId, scaleFactor, submitCard, isAnimating }) => {
  const [options, setOptions] = useState([]);
  const containerStyle = {
    position: 'absolute',
    left: '50%',
    bottom: '3%',
    transform: `translate(-50%, 0) scale(${scaleFactor})`,
    display: 'flex',
    justifyContent: 'center'
  }
  const tl = new TimelineLite;

  function handleClick(e){
    if(!isAnimating){
      const cardClass = e.currentTarget.classList[0];
      //.hand-value-color
      const classArr = cardClass.split('-');
      let isOption = false;
      for(let i = 0; i< options.length; i++){
        if(options[i].value == classArr[1] && options[i].color === classArr[2]){
          isOption = true;
          break;
        }
      }
      if(isOption){
        const source = document.querySelector(`.${cardClass}`);
        const target = document.getElementById('card-in-play');
        const sBox = source.getBoundingClientRect();
        const tBox = target.getBoundingClientRect();
        const translate = {
          x: tBox.x - sBox.x,
          y: tBox.y - sBox.y
        }
        const variance = Math.random() * (5 - (-5)) + (-5);

        tl
        .to(source, .5, {x: translate.x/scaleFactor, y: translate.y/scaleFactor, rotation: variance, scale: 1.2,
          onComplete: () => {
            submitCard({value: classArr[1], color: classArr[2], variance: variance})
          }
        })
        .to('.hand-card', .5, {yPercent: 0})
      }
    }
  }

  useEffect(() => {
    if(isMyTurn){
      const options = [
        {value:1, color: 'green', id:0},
        {value:3, color: 'green', id:2}
      ]
      let selector = options.reduce((acc, cur) => {
        return acc += `.hand-${cur.value}-${cur.color}, `
      }, '')
      selector = selector.substring(0, selector.length-2)
      tl.to(selector, .5, {yPercent: -50})

      setOptions(options);
    }
  }, [isMyTurn]);


  return(
    <div style = {containerStyle}>
      {
        hand.map((item, i) =>
          <HandCard
            key = {item.color + item.value + '' + i}
            value = {item.value}
            color = {item.color}
            cClass = {`hand-${item.value}-${item.color} hand-card`}
            style = {{
              transformOrigin: 'top left',
            }}
            submitCard = {handleClick}
          />
        )
      }
     </div>
  );
}, (oldP, newP) => {

})

export default Hand;
