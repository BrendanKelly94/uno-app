import React, { useState, useEffect } from "react";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import ApiEndpoint from "../utils/ApiEndpoint.js";
import CustomError from "../utils/CustomError.js";
import useScale from "../utils/useScale.js";
import useError from "../utils/useError.js";

function AuthModal({ open, setOpen, login }) {
  const [auth, setAuth] = useState({ name: "", pwd: "", rePwd: "" });
  const [reg, setReg] = useState(false);
  const [success, setSuccess] = useState(false);
  const scaleFactor = useScale();
  const [error, errorHandler] = useError();
  const [width, setWidth] = useState(scaleFactor.size < 1.2 ? "90%" : "50%");

  const containerStyle = {
    position: "absolute",
    width: width,
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)"
  };

  const modalStyle = {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    backgroundColor: "#fff"
  };

  const errStyle = {
    backgroundColor: "red",
    color: "#fff",
    transform: "scaleY(1)"
  };

  const successStyle = {
    backgroundColor: "green",
    color: "#fff",
    transform: "scaleY(1)"
  };

  const messageStyle = {
    width: "100%",
    height: "2em",
    transform: "scaleY(0)",
    transition: "transform .5s",
    transformOrigin: "bottom",
    textAlign: "center"
  };

  async function handleLogin(){
    errorHandler(async () => {
      const loginData = await new ApiEndpoint("/login").postReq({
        name: auth.name,
        pwd: auth.pwd
      });
      if (loginData.hasOwnProperty("name")) {
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
        }, 500);
        login(auth.name, auth.pwd);
      }
    })();
  }

  async function handleRegister(){
    errorHandler(async () => {
      if(auth.pwd !== auth.rePwd){
        throw new CustomError({
          status:200,
          message: "Passwords do not match"
        })
      }

      const regData = await new ApiEndpoint("/register").postReq({
        name: auth.name,
        pwd: auth.pwd
      });
      if (regData.hasOwnProperty("name")) {
        setStatus({ err: null, success: true });
        setTimeout(() => {
          setOpen(false);
        }, 500);
        login(auth.name, auth.pwd);
      }
    })();
  }

  useEffect(
    () => {
      if (scaleFactor.size < 1.2) {
        setWidth("90%");
      } else {
        setWidth("50%");
      }
    },
    [scaleFactor]
  );

  return (
    <Modal
      aria-labelledby="log into account"
      aria-describedby="log in or register popup"
      open={open}
      onClose={setOpen}
    >
      <div style={containerStyle}>
        {
          <div
            style={
              error.status
                ? { ...messageStyle, ...errStyle }
                : success
                ? { ...messageStyle, ...successStyle }
                : messageStyle
            }
          >
            {error.status && !success && <div>{error.message}</div>}
            {success && <div>{"You have successfully logged in!"}</div>}
          </div>


        }
        <div style={modalStyle}>
          <TextField
            id="user-name-input"
            label="UserName"
            margin="normal"
            variant="outlined"
            value={auth.name}
            style={{ margin: ".5em" }}
            onChange={e => setAuth({ ...auth, name: e.target.value })}
          />
          <TextField
            id="password-input"
            label="Password"
            type="password"
            margin="normal"
            variant="outlined"
            value={auth.pwd}
            style={{ margin: ".5em" }}
            onChange={e => setAuth({ ...auth, pwd: e.target.value })}
          />
          {reg && (
            <TextField
              id="re-password-input"
              label="Re-Password"
              type="password"
              margin="normal"
              variant="outlined"
              value={auth.rePwd}
              style={{ margin: ".5em" }}
              onChange={e => setAuth({ ...auth, rePwd: e.target.value })}
            />
          )}
          <Button onClick={reg ? handleRegister : handleLogin}>
            {reg ? "Create Account" : "Log In"}
          </Button>
          <button onClick={() => setReg(!reg)}>
            {reg ? "Already have account?" : "Don't have account?"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default AuthModal;
