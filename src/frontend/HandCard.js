import React from 'react';

const HandCard = React.forwardRef(({ value, color , style, cId, cClass, submitCard }, ref) => {
  const ellipseStyle = {
    fill: '#fff',
    strokeWidth: '2',
    stroke: color,
    transformOrigin: 'center',
    transform: 'rotate(-60deg)'
  }

  let item = value;
  switch(value){
    case 10:
      item = 'Rev'
    break;
    case 11:
      item = 'Skip'
    break;
    case 12:
      item = '+2'
    break;
    case 13:
      item = 'Wild'
    break;
    case 14:
      item = '+4'
    break;
    default:
      item = value
    break;
  }

  return(
    <svg ref = {ref} id = {cId? cId: ''} className = {cClass? cClass: ''} onClick = {submitCard?submitCard: () => true} viewBox="0 0 50 70" width = "50" height = "70" style = {style? style: {}} xmlns="http://www.w3.org/2000/svg" >

      <rect x="1" y="1" width="48" height="68" rx="5" ry="5" style = {{fill:'#fff',strokeWidth:'1', stroke:'#000'}}/>
      {
        (value <= 9)?
        <React.Fragment>
          <text x = "5%" y= "5%" dominantBaseline = "hanging"> {item} </text>
          <text x = "80%" y = "95%" dominantBaseline = "baseline"> {item} </text>
        </React.Fragment>
        :null
      }


      <svg width="50" height="70">
        <ellipse cx="50%" cy="50%" rx="30" ry="15" style = {ellipseStyle}/>
        <text dominantBaseline="middle" textAnchor = "middle" x = "50%" y = "50%"> {item} </text>
      </svg>

    </svg>
  )
});

export default HandCard;
