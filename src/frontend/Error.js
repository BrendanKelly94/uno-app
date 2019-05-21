import React from 'react';

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
  return(
    <div style = {containerStyle}>
      {message} with status: {status}
    </div>
  );
}

export default Error;
