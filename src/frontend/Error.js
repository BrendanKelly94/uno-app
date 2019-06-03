import React from 'react';
import Button from './Button.js';
import history from './utils/history.js';

function Error({status, message}){
  const containerStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    left: '0',
    top: '0'
  }

  const contentStyle = {
    display: 'flex',
    backgroundColor: '#fff',
    padding: '3em 5em 3em 5em'
  }

  function handleClick(){
    history.push('/');
  }

  return(
    <div style = {containerStyle}>
      <div style = {contentStyle}>
        {message} with status: {status}
        <Button onClick = {handleClick}>Home</Button>
      </div>
    </div>
  );
}

export default Error;
