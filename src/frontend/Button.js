import React, {useState, useEffect, useRef} from 'react';
import {TimelineLite} from 'gsap';

const Button = React.forwardRef(({children, color, onClick, style, variant}, ref) => {

  const outlinedStyle = {
    display: 'flex',
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
    fontFamily: 'Lato, sans-serif'
  }

  const defaultStyle = {
    display: 'flex',
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
    fontFamily: 'Lato, sans-serif'
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
    setButtonStyle((variant === 'outlined')? outlinedStyle: defaultStyle)
  }

  function handleClick(e){
    // const rect = circleRef.current.getBoundingClientRect();
    // const circleX = (rect.x + rect.width/2);
    // const circleY = (rect.y + rect.height/2);


    // tl
    // .set(circleRef.current, { x:e.clientX - circleX, y: e.clientY - circleY, opacity: 1})
    // .to(circleRef.current, 1, {scale: 40, opacity: 0})
    // .set(circleRef.current, {x:0, y:0, scale:1})
    // circleRef.current.style.transform = `translate(${e.clientX - circleX}px, ${e.clientY - circleY}px) scale(40) `
    // setTimeout(() => {
    //
    // },500);


    onClick();
  }

  // <svg
  //   style = {svgStyle}
  //   ref = {svgRef}
  // >
  //   <circle ref = {circleRef} cx="50%"  cy= "50%" r="1" fill={`${color}`} style = {{opacity: 0, transformOrigin: 'center', transition: 'all .5s ease'}}/>
  // </svg>


  useEffect(() => {
    setButtonStyle(buttonStyle)
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
        <p style ={{margin:0}} >{children}</p>

      </React.Fragment>
    </button>
  );
});

export default Button;
