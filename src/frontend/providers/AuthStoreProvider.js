import React, { useContext } from "react";
import authStoreContext from "../context/authStoreContext";

const initialState = {
  user_name: "",
  pwd: ""
};

function AuthStoreProvider({ children }) {
  const [state, setState] = React.useState(initialState);
  const contextValue = React.useMemo(() => [state, setState], [state]);
  return (
    <authStoreContext.Provider value={contextValue}>
      {children}
    </authStoreContext.Provider>
  );
}

export default AuthStoreProvider;
