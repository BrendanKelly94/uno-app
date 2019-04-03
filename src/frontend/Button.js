import React, {useState, useEffect, useRef} from 'react';
import {TimelineLite} from 'gsap';

const Button = React.forwardRef(({children, color, onClick, style, variant}, ref) => {

  const outlinedStyle = {
    height: '2em',
    border: `.05em solid ${color}`,
    borderRadius: '4px',
    color: `${color}`,
    backgroundColor: 'transparent',
    transition: 'all .5s ease',
    fontSize: '1em',
    zIndex: 1,
  }

  const defaulStyle = {
    height: '2em',
    color: `${color}`,
    border: '.05em solid transparent',
    backgroundColor: 'transparent',
    transition: 'all .5s ease',
    fontSize: '1em',
    zIndex: 1,
  }
  
  const [ buttonStyle, setButtonStyle ] = useState(variant === 'outlined'? outlinedStyle:defaultStyle);
  const [ tl, setTl ] = useState(new TimelineLite);
  const circleRef = useRef(null);
  const svgRef = useRef(null);

  const first = null;

  const svgStyle = {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 0,
    width: '100%',
    height: '100%'
  }

  function mouseEnter(){
    setButtonStyle(prevState => {
      return{
        ...prevState,
        backgroundColor: `${color}40`,
      }
    })
  }

  function mouseLeave(){
    setButtonStyle((prevState) => {
      return{
        ...prevState,
        backgroundColor: 'transparent',
      }
    })
  }

  function handleClick(e){
    const rect = circleRef.current.getBoundingClientRect();
    const circleX = rect.x + rect.width/2;
    const circleY = rect.y + rect.height/2;

    console.log(rect)

    tl
    .set(circleRef.current, { x:e.clientX - circleX, y: e.clientY - circleY, opacity: 1, scale: 0 })
    .to(circleRef.current, .75, {scale: 1, opacity: 0})
    .set(circleRef.current, {x:0, y:0, scale:1})

    onClick();
  }


  useEffect(() => {
    setButtonStyle({
      height: '2em',
      border: `.05em solid ${color}`,
      borderRadius: '4px',
      color: `${color}`,
      backgroundColor: 'transparent',
      transition: 'all .5s ease',
      fontSize: '1em'
    })
  }, [color])

  return(
    <button
      onMouseEnter = {mouseEnter}
      onMouseLeave = {mouseLeave}
      onClick = {handleClick}
      style = {{...style, ...buttonStyle}}
      ref = {ref}
    >
      <React.Fragment>
        {children}
        <svg
          style = {svgStyle}
          ref = {svgRef}
        >
          <circle ref = {circleRef} cx="50%"  cy= "50%" r="40" fill={`${color}`} transform = "scale(0)" style = {{transformOrigin: 'center'}}/>
        </svg>
      </React.Fragment>
    </button>
  );
});

export default Button;
