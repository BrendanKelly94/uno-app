import React, {useState, useEffect} from 'react';
import {TimelineLite} from 'gsap';

const OutlinedButton = React.forwardRef(({children, color, onClick, style}, ref) => {

  const [ buttonStyle, setButtonStyle ] = useState({
    height: '2em',
    border: `.05em solid ${color}`,
    borderRadius: '4px',
    color: `${color}`,
    backgroundColor: 'transparent',
    transition: 'all .5s ease',
    fontSize: '1em'
  });
  const [ clickTransform, setClickTransform ] = useState({x: 0, y: 0, scale: 0})
  const [ tl, setTl ] = useState(new TimelineLite);

  function mouseEnter(){
    setButtonStyle(prevState => {
      return{
        ...prevState,
        backgroundColor: `${color}40`,
        border: `.05em solid ${color}`
      }
    })
  }

  function mouseLeave(){
    setButtonStyle((prevState) => {
      return{
        ...prevState,
        backgroundColor: 'transparent',
        border: `.05em solid ${color}`
      }
    })
  }

  function handleClick(e){
    const rect = e.currentTarget.getBoundingClientRect();
    setClickTransform({
        x: rect.x + e.clientX,
        y: rect.y + e.clientY,
        scale: 1
    })
    onClick();
  }

  useEffect(() => {
    if(clickTransform.scale === 1){

    setTimeout(() => {
      setClickTransform((prevState) => {
        return {
          ...prevState,
          scale: 0
        }
      })
    }, 500)
    }
  }, [clickTransform.scale])

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
        <svg height="100" width="100"
          style = {{position: 'absolute',transition: 'all .5s ease', transformOrigin: 'center'}}
          transform = {`translate(${clickTransform.x}, ${clickTransform.y}) scale(${clickTransform.scale})`}
        >
          <circle cx="50" cy="50" r="40" stroke-width="3" fill={`${color}`}
          />
        </svg>
      </React.Fragment>
    </button>
  );
});

export default OutlinedButton;
