import React from 'react';

function HandCard({ value, color , style, cId, cClass, submitCard }){
  const ellipseStyle = {
    fill: '#fff',
    strokeWidth: '1',
    stroke: color,
    transformOrigin: 'center',
    transform: 'rotate(-60deg)'
  }

  return(
    <svg id = {cId? cId: ''} className = {cClass? cClass: ''} onClick = {submitCard?submitCard: () => true} viewBox="0 0 50 70" width = "50" height = "70" style = {style? style: {}} xmlns="http://www.w3.org/2000/svg" >

      <rect x="1" y="1" width="calc(100% - 2)" height="calc(100% - 2)" rx="5" ry="5" style = {{fill:'#fff',strokeWidth:'1', stroke:'#000'}}/>
      <text x = "5%" y= "5%" alignmentBaseline = "hanging"> {value} </text>
      <text x = "80%" y = "95%" alignmentBaseline = "baseline"> {value} </text>

      <svg width="100%" height="100%">
        <ellipse cx="50%" cy="50%" rx="30" ry="15" style = {ellipseStyle}/>
        <text dx = "-4" alignmentBaseline="middle" x = "50%" y = "50%"> {value} </text>
      </svg>

    </svg>
  )
}

export default HandCard;
