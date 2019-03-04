import React from 'react';

function Card({ cId, style, callback }){
  const cardStyle = {
    width: '50px',
    height: '70px',
    boxSizing: 'border-box',
    border: '1px #000 solid',
    borderRadius: '5px',
    backgroundColor: 'blue',
  }
  return(
    <div id = {cId?cId:''} onClick = {callback? callback: () => true}style = {style?{...cardStyle, ...style}:cardStyle}></div>
  );
}

export default Card;
