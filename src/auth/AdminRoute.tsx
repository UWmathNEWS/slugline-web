import React, { useState, useEffect } from "react";
import { RouteProps, Route, Redirect } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const AdminRoute: React.FC<RouteProps> = (props: RouteProps) => {
  const auth = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    auth.check()
      ?.then(() => { setReady(true); })
      ?.catch(e => { console.log(e); });
  });

  if (ready) {
    if (auth.isEditor()) {
      return <Route {...props}>{props.children}</Route>;
    } else {
      // TODO: make 404 route
      return <Redirect to="/login"/>;
    }
  } else {
    return <h1>Loading...</h1>;
  }
};

export default AdminRoute;
