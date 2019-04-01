import React, {useState, useRef, useEffect} from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

function Chat({chatToggle, socket, gameId, userName}){
  const [ message, setMessage ] = useState('');
  const messages = useRef(null);
  const first = null

  const messageContainer = {
    width: '80%',
    fontFamily: 'Heebo sans-serif'
  }

  const sendContainerStyle = {
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  }

  const chatOverlayStyle = {
    backgroundColor: 'rgba(0, 0, 0, .5)',
    position: 'absolute',
    display: (chatToggle)? 'flex': 'none',
    top: 0,
    left: 0,
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    color: '#fff',
    transition: 'all .5 ease',
    zIndex: 10
  }

  function sendMessage(e){
    socket.emit('newMessage', {gameId: gameId, userName: userName, message: message})
  }

  useEffect(() => {
    socket.on('chatMessage', (data) => {
      if(data.user_name === userName){
        messages.current.innerHTML += `<p style = "margin-left: 2em; text-align:left">${data.user_name}: ${data.message}</p>`
      }else{
        messages.current.innerHTML += `<p style = "margin-right: 2em; text-align:right">${data.user_name}: ${data.message}</p>`
      }
      setMessage('')
    })
  }, [first])

  return (
    <div style = {chatOverlayStyle}>
      <div style = {sendContainerStyle}>

        <TextField
          label="Message"
          variant = "outlined"
          multiline
          value={message}
          onChange = {(e) => setMessage(e.target.value)}
          style = {{marginTop: '1em', marginBottom: '1em', width: '40%', backgroundColor: '#fff', borderRadius: '4px'}}
        />
        <Button onClick = {sendMessage} color = 'primary'> Send </Button>
      </div>
      <div style = {messageContainer} ref = {messages}>
      </div>
    </div>
  );
}

export default Chat;
