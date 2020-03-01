import React, { useState, useEffect } from "react";
import { RouteProps, Route, Redirect } from "react-router-dom";
import { Alert } from "react-bootstrap";
import { useAuth } from "./AuthProvider";

interface PrivateRouteProps extends RouteProps {
  admin?: boolean
}

const PrivateRoute: React.FC<PrivateRouteProps> = (props: PrivateRouteProps) => {
  const auth = useAuth();
  const [ready, setReady] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    auth.check()
      ?.then(() => {
        setReady(true);
        setErrors([]);
      }, e => { setErrors(e); });
  });

  if (ready) {
    if (auth.isAuthenticated() && ((props.admin && auth.isEditor()) || !props.admin)) {
      return <Route {...props}>{props.children}</Route>;
    } else {
      return <Redirect to="/login"/>;
    }
  } else {
    return errors.length ? (<>
      {errors.map(err => <Alert key={err} variant="danger">{err}</Alert>)}
    </>) : <h1>Loading...</h1>;
  }
};

export default PrivateRoute;
