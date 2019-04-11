import React, {useState, useRef, useEffect} from 'react';
import Button from './Button';
import TextField from '@material-ui/core/TextField';

function Chat({chatToggle, socket, gameId, userName, setCurrentMessage, scale}){
  const [ message, setMessage ] = useState('');
  const messages = useRef(null);
  const first = null;

  const messageContainer = {
    marginTop: '2em',
    width: '80%',
    height: '70%',
    fontFamily: 'Lato, sans-serif',
    overflowY: 'scroll'
  }

  const sendContainerStyle = {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignSelf: 'flex-end'

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
    justifyContent: 'space-around',
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
      setCurrentMessage({message:data.message, userName: data.user_name});
    })
  }, [first])

  return (
    <div style = {chatOverlayStyle}>
      <div style = {messageContainer} ref = {messages}>
      </div>
      <div style = {sendContainerStyle}>
        <TextField
          label="Message"
          variant = "outlined"
          multiline
          value={message}
          onChange = {(e) => setMessage(e.target.value)}
          style = {{margin: '1em .5em 1em .5em', width: `${100 * (2-scale)}%`, backgroundColor: '#fff', borderRadius: '4px'}}
        />
        <Button style = {{margin: '1em .5em 1em 0'}} onClick = {sendMessage} variant = 'default' color = '#ffffff'> Send </Button>
      </div>


    </div>
  );
}

export default Chat;
