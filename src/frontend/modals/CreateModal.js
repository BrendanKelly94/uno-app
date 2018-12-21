import React, { useState } from 'react';
import Modal from '@material-ui/core/Modal';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import history from '.././utils/history.js';

function CreateModal({ open, setOpen }){
  const [ fillBots, setFillBots ] = useState(false);
  const [ err, setErr ] = useState(null);

  const containerStyle = {
    position: 'absolute',
    width: '50%',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)'
  }

  const modalStyle = {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    backgroundColor: '#fff'
  }


  const handleCreate = async () => {
    const res = await fetch('http://localhost:3000/api/newGame', {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({botFill: fillBots})
    })
    const json = await res.json();
    if(json.hasOwnProperty(err)){
      setError(json.err)
    }else{
      history.push(`game/${json.id}`);
    }
  }

  return(
    <Modal
          aria-labelledby="log into account"
          aria-describedby="log in or register popup"
          open={open}
          onClose={setOpen}
        >
        <div style={containerStyle}>
          <div style={modalStyle} >
            <button onClick = {() => setOpen()}> x </button>
            <FormControlLabel
              control={
                <Checkbox
                  checked={fillBots}
                  onChange={() => setFillBots(!fillBots)}
                  value="checkedB"
                  color="primary"
                />
                }
                label="fill with bots"
            />
            <Button onClick = {handleCreate}>Create Game</Button>
          </div>
        </div>
    </Modal>
  )
}

export default CreateModal;
