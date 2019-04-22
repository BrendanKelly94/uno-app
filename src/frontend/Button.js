import React, {useState, useEffect, useRef} from 'react';
import {TimelineLite} from 'gsap';

const Button = React.forwardRef(({children, color, onClick, style, variant}, ref) => {

  const outlinedStyle = {
    display: 'flex',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    border: `.05em solid ${color}`,
    borderRadius: '4px',
    color: `${color}`,
    backgroundColor: 'transparent',
    transition: 'all .5s ease',
    fontSize: '1em',
    zIndex: 11,
    padding: '.5em 1em .5em 1em',
    fontFamily: 'Lato, sans-serif',
  }

  const defaultStyle = {
    display: 'flex',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    color: `#191d1b`,
    fontSize: 'bold',
    border: 'none',
    backgroundColor: color,
    transition: 'all .5s ease',
    fontSize: '1em',
    zIndex: 11,
    padding: '.5em 1em .5em 1em',
    fontFamily: 'Lato, sans-serif',

  }

  const [ buttonStyle, setButtonStyle ] = useState(variant === 'outlined'? outlinedStyle:defaultStyle);
  const [ animate, setAnimate ] = useState(false);
  const circleRef = useRef(null);
  const animateRef = useRef(null);
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
    setButtonStyle((variant === 'outlined')? outlinedStyle: defaultStyle)
  }

  function handleClick(e){
    const rect = circleRef.current.getBoundingClientRect();
    const circleX = (rect.x + rect.width/2);
    const circleY = (rect.y + rect.height/2);
    circleRef.current.style.transform = `translate(${e.clientX-circleX}px, ${e.clientY-circleY}px)`
    animateRef.current.beginElement();
    onClick();
  }

  useEffect(() => {
    setButtonStyle(buttonStyle)
  }, [color])

  return(
    <div style = {{...style, display: 'flex', justifyContent: 'center'}}>
    <button
      onMouseEnter = {mouseEnter}
      onMouseLeave = {mouseLeave}
      onClick = {handleClick}
      style = {buttonStyle}
      ref = {ref}
    >
        <svg
          style = {svgStyle}
          ref = {svgRef}
        >
          <circle ref = {circleRef} cx="50%"  cy= "50%" r="0" fill={`${color}`} style = {{opacity: 1, transformOrigin: 'center'}}>
              <animate ref = {animateRef} attributeName="r" from="0" to="200"
            dur=".5s" repeatCount="0" begin = 'indefinite' fill = "remove"/>
          </circle>

        </svg>
        <p style ={{margin:0}} >{children}</p>

    </button>
    </div>
  );
});

export default Button;
