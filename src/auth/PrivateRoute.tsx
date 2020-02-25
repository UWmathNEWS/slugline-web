import React, { useState, useEffect } from "react";
import { RouteProps, Route, Redirect } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const PrivateRoute: React.FC<RouteProps> = (props: RouteProps) => {
  const auth = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    auth.check()
      ?.then(() => { setReady(true); })
      ?.catch(e => { console.log(e); });
  });

  if (ready) {
    if (auth.isAuthenticated()) {
      return <Route {...props}>{props.children}</Route>;
    } else {
      return <Redirect to="/login"/>;
    }
  } else {
    return <h1>Loading...</h1>;
  }
};

export default PrivateRoute;
