import React, {useEffect} from 'react';

const HandCard = React.memo(React.forwardRef(({ value, color , style, cId, cClass, submitCard }, ref) => {

  const colorEnum = {
    "red": "#FF4747",
    "yellow": '#FFFF87',
    "green": '#ACDB85',
    "blue": '#84BAB7'
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
      <defs>
        <linearGradient id={`${color}-grad`} x1="0%" y1="20%" x2="100%" y2="80%" >
          <stop offset="0%" stopColor = {'#ffffff'} stopOpacity = {1}/>
          <stop offset="10%" stopColor = {'#ffffff'} stopOpacity = {1}/>
          <stop offset="100%" stopColor = {colorEnum[color]} stopOpacity = {1} />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="48" height="68" rx="5" ry="5" style = {{fill:`url(#${color}-grad)`,strokeWidth:'1', stroke:'#000'}}/>
      <text x = "5%" y= "5%" dominantBaseline = "hanging" style = {{fontFamily: `Quicksand, sans-serif`}}> {item} </text>

    </svg>
  )
}), (oldP, newP) => {
  /*
  if(oldP.color !== newP.color && oldP.value !== newP.value && (newP.cId === 'new' || newP.cId === 'card-in-play')){
    return false;
  }else if((newP.cId !== 'new' || newP.cId !== 'card-in-play') && newP.submitCard !== oldP.submitCard){
    return false;
  }else{
    return true;
  }
  */
});

export default HandCard;

// {
//   (value <= 9)?
//   <React.Fragment>
//     <text x = "5%" y= "5%" dominantBaseline = "hanging"> {item} </text>
//     <text x = "80%" y = "95%" dominantBaseline = "baseline"> {item} </text>
//   </React.Fragment>
//   :null
// }

// <text dominantBaseline="middle" textAnchor = "middle" x = "50%" y = "50%"> {item} </text>
