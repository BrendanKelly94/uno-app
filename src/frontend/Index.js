import React from "react";
import ReactDOM from "react-dom";
import { Router, Route, Switch } from "react-router-dom";
import App from "./App.js";
import Home from "./Home.js";
import GamesList from "./GamesList.js";
import Lobby from "./Lobby.js";
import HostLobby from "./HostLobby.js";
import AuthStoreProvider from "./providers/AuthStoreProvider";
import history from "./utils/history.js";

function Index() {
  return (
    <AuthStoreProvider>
      <Router history={history}>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/gamesList" exact component={GamesList} />
          <Route path="/lobby/:id" exact component={Lobby} />
          <Route path="/game/:id" exact component={App} />
        </Switch>
      </Router>
    </AuthStoreProvider>
  );
}
const rootElement = document.getElementById("root");
ReactDOM.render(<Index />, rootElement);
