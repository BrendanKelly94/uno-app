import React, { useContext, useState, useEffect } from 'react';
import { TweenLite, TimelineLite } from 'gsap';
import gameStoreContext from './context/gameStoreContext';
import authStoreContext from './context/authStoreContext';
import useScale from './utils/useScale';
import BuildPlayers from './utils/BuildPlayers'
import FindInitTransform from './utils/FindInitTransform';
import InitialState from './utils/InitialState';
import Player from './Player';
import CardInPlay from './CardInPlay';
import Hand from './Hand'
import HandCard from './HandCard';
import Card from './Card'
import DrawCard from './DrawCard';
import io from 'socket.io-client';

function App() {
  const [ state, setState ] = useState(InitialState)
  const [ login, setLogin ] = useContext(authStoreContext);
  const [ isAnimating, setIsAnimating ] = useState(false);
  const [ isFirstRender, setIsFirstRender ] = useState(true);
  const scaleFactor = useScale();
  const [ shiftedPlayers, setShiftedPlayers ] = useState([]);


  const middleStyle = {
    display: 'flex',
    justifyContent: 'space-evenly',
    position: 'absolute',
    left: `calc(50%)`,
    top: `calc(50%)`,
    width: '10em',
    transform: `translate(-50%, -50%) ${`scale(${scaleFactor.size + .2})`}`
  }
  const tl = new TimelineLite;



  function updateCardCount(num){
    const temp = state.players.slice();
    const index = temp.findIndex(player => player.id === state.last_turn_id);
    temp[index].cardCount += num;
    temp[index].isAnimating = false;
    setState({
      ...state,
      players: temp
    })
  }

  function nextTurn(){
    const cards = [
      {value: -1, color: ''},
      {value: state.turn_id, color: 'blue'}
    ];
    const random = Math.floor(Math.random() * 2);
    const index = state.players.findIndex(player => player.id === state.turn_id);
    setState({
      ...state,
      newCard: cards[random],
      last_turn_id: state.turn_id,
      turn_id: state.players[(index + 1) % state.players.length].id
    })
  }

  function submitCard({ value, color, variance }){
    const playerIndex = state.players.findIndex(player => player.id === state.turn_id);
    const tempHand = state.hand.slice();
    const cardIndex = tempHand.findIndex(card => card.value == value && card.color === color);
    const deleted = tempHand.splice(cardIndex, 1);
    setState({
      ...state,
      hand: tempHand,
      middleCard: {...deleted[0], variance: variance},
      last_turn_id: state.turn_id,
      turn_id: state.players[(playerIndex + 1) % state.players.length].id
    })
    // emit submitCard socket event
  }

  function setPlayerAnimation(lastTurnId){
    const temp = state.players.slice();
    temp[lastTurnId].isAnimating = true
    setState({...state, players: temp})
  }

  //cdm
  useEffect(async () => {
    if(isFirstRender){
      try{
        const res = await fetch(process.env.URL + '/game')
        setShiftedPlayers(BuildPlayers({
          players: state.players,
          username: login.user_name,
          scaleFactor: scaleFactor
        }))
        setIsFirstRender(false);
      }catch(e){

      }
    }
  })

  //re-render players when scaleFactor changes
  useEffect(() => {
    setShiftedPlayers(BuildPlayers({
      players: state.players,
      username: login.user_name,
      scaleFactor: scaleFactor
    }))
  },[scaleFactor])

  //animate player's new card to middle
  useEffect(() => {
    if(state.newCard.value !== -1 && state.last_turn_id !== state.my_id){
      let source = document.getElementById('new');
      let target = document.getElementById(`player-${state.last_turn_id}-card-0`);
      const lastTurnId = state.players.findIndex(player => player.id === state.last_turn_id);
      const initTransform = FindInitTransform(target, state.players[lastTurnId].rotate, scaleFactor.size);
      // animate
      target = document.getElementById('card-in-play')
      const bBox = target.getBoundingClientRect();
      const variance = Math.random() * (5 - (-5)) + (-5);

      setIsAnimating(true);
      tl
      .to(source, 0, {x: initTransform.x, y: initTransform.y, rotation: initTransform.rotate, scale: scaleFactor.size,
        onComplete: () => setPlayerAnimation(lastTurnId)
      })
      .to(source, .25, {opacity: 1, onComplete: () => updateCardCount(-1)}, '+=.25')
      .to(source, .5, {x: bBox.x, y: bBox.y, rotation: variance, scale: scaleFactor.size + .2,
        onComplete: () => {
          setState({...state, middleCard: {...state.newCard, variance: variance}})
        }
      })
      .to(source, 0 , {opacity:0, onComplete: () => setIsAnimating(false)})
    }else{
      if(!isFirstRender){
        setIsAnimating(true);
        tl.to('draw-card', .5, {
          onComplete: () => {
            updateCardCount(1);
            setIsAnimating(false);
          }
        })
      }
    }
  }, [state.newCard]);

  //animate my new card to middle
  useEffect(() => {
    if(state.last_turn_id === state.my_id){
      const target = document.getElementById('card-in-play');
      //replace source with card from socket event
      const source = document.getElementById(`hand-${1}-${'green'}`)
      const tBox = target.getBoundingClientRect();
      const sBox = source.getBoundingClientRect();
      const variance = Math.random() * (5 - (-5)) + (-5);

      tl
      .to(source, .5, {x: (tBox.x - sBox.x)/scaleFactor, y:(tBox.y - sBox.y)/scaleFactor,
        onComplete: () => {
          setState({...state, middleCard: {...state.newCard, variance: variance}})
        }
      })
      .to(source, 0, {opacity: 0})
    }
  }, [state.newCard]);

  return (

      <div>
        <button style = {{ float: 'right'}} onClick = {nextTurn}>NextTurn</button>
        {
          shiftedPlayers.map((player) =>
            <Player
              key = {`player-${player.id}`}
              pId = {player.id}
              cardCount = {player.cardCount}
              isAnimating = {player.isAnimating}
              translate = {player.translate}
              rotate = {player.rotate}
              scale = {scaleFactor.size}
            />
          )
        }

        <div style = {middleStyle}>
          <DrawCard
            lastTurnId = {state.last_turn_id}
            newCard = {state.newCard}
            scaleFactor = {scaleFactor.size + .2}
            isMyTurn = {(state.turn_id === state.my_id)? true: false}
          />
          <CardInPlay card = {state.middleCard}/>
        </div>

        <Hand
          hand = {state.hand}
          isMyTurn = {(state.turn_id === state.my_id)? true: false}
          lastTurnId = {state.last_turn_id}
          scaleFactor = {scaleFactor.size}
          submitCard = {submitCard}
          isAnimating = {isAnimating}
        />


        <HandCard
          cId = 'new'
          value = {state.newCard.value}
          color = {state.newCard.color}
          style = {{
            position: 'absolute',
            left: 0,
            top: 0,
            transformOrigin: 'top left',
            opacity: 0
          }}
        />
      </div>
  );
}

export default App;
