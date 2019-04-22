import React, { useState, useEffect } from 'react';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField';
import ApiEndpoint from '../utils/ApiEndpoint.js';
import useScale from '../utils/useScale.js';

function AuthModal({ open , setOpen, login }){
  const [ auth, setAuth ] = useState({name: '', pwd: '', rePwd: ''});
  const [ reg, setReg ] = useState(false);
  const [ status , setStatus ] = useState({err: false, success: null})
  const scaleFactor = useScale();
  const [ width, setWidth ] = useState(scaleFactor.size < 1.2? '90%':'50%')



  const containerStyle = {
    position: 'absolute',
    width: width,
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)'
  }

  const modalStyle = {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    backgroundColor: '#fff',
  }

  const errStyle = {
    backgroundColor: 'red',
    color: '#fff',
    transform: 'scaleY(1)',
  }

  const successStyle = {
    backgroundColor: 'green',
    color: '#fff',
    transform: 'scaleY(1)',
  }

  const messageStyle = {
    width: '100%',
    height: '2em',
    transform: 'scaleY(0)',
    transition: 'transform .5s',
    transformOrigin: 'bottom',
    textAlign: 'center',
  }

  const handleLogin = async () => {
    try{

      const loginData = await new ApiEndpoint('/login').postReq({name: auth.name, pwd: auth.pwd})
      if(loginData.hasOwnProperty('name')){
        setStatus({err: null, success: true})
        setTimeout(() => {
          setOpen(false);
        }, 500)
        login(auth.name, auth.pwd)
      }else{
        setStatus({err: loginData.err})
      }
    }catch(e){
      setStatus({err: e})
    }
  }

  const handleRegister = async () => {
    if(auth.pwd !== auth.rePwd){
      setStatus({err:'passwords do not match'})
    }
    try{

      const regData = await new ApiEndpoint('/register').postReq({name: auth.name, pwd: auth.pwd});
      if(regData.hasOwnProperty('name')){
        setStatus({err: null, success: true});
        setTimeout(() => {
          setOpen(false);
        }, 500)
        login(auth.name, auth.pwd)
      }else{
        setStatus({...status, err: regData.err});
      }
    }catch(e){
      setStatus({...status, err: e});
    }
  }

  useEffect(() => {
    if(!open){
      setStatus({...status, err: null});
    }
  },[open])

  useEffect(() => {
    if(scaleFactor.size < 1.2){
      setWidth('90%')
    }else{
      setWidth('50%');
    }
  }, [scaleFactor])

  const { err, success } = status;
  return(
    <Modal
          aria-labelledby="log into account"
          aria-describedby="log in or register popup"
          open={open}
          onClose={setOpen}
        >
        <div style = {containerStyle}>
          {
          <div style = {err?{...messageStyle, ...errStyle}:success?{...messageStyle, ...successStyle}:messageStyle}>
            {err?err:null}
            {success?'You have successfully logged in!':null}
          </div>
          }
          <div style={modalStyle} >
            <TextField
              id="user-name-input"
              label="UserName"
              margin="normal"
              variant="outlined"
              value = {auth.name}
              style = {{margin: '.5em'}}
              onChange = {(e) => setAuth({...auth, name:e.target.value})}
            />
            <TextField
              id="password-input"
              label="Password"
              type="password"
              margin="normal"
              variant="outlined"
              value = {auth.pwd}
              style = {{margin: '.5em'}}
              onChange = {(e) => setAuth({...auth, pwd:e.target.value})}
            />
            {reg && <TextField
              id="re-password-input"
              label="Re-Password"
              type="password"
              margin="normal"
              variant="outlined"
              value = {auth.rePwd}
              style = {{margin: '.5em'}}
              onChange = {(e) => setAuth({...auth, rePwd:e.target.value})}
              />
            }
            <Button onClick = {reg?handleRegister:handleLogin}>{reg?'Create Account': 'Log In'}</Button>
            <button onClick = {() => setReg(!reg)}>{reg?'Already have account?': "Don't have account?"}</button>
          </div>
          </div>
    </Modal>
  )
}

export default AuthModal;
