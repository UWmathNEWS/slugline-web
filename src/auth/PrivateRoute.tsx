import React, { useEffect, useReducer } from "react";
import { RouteProps, Route, Redirect, useHistory } from "react-router-dom";
import { Alert } from "react-bootstrap";
import { useAuth } from "./AuthProvider";

interface PrivateRouteProps extends RouteProps {
  admin?: boolean
}

interface PrivateRouteState {
  ready: boolean,
  errors: string[]
}

type PrivateRouteAction =
  { type: 'done loading' } |
  { type: 'is loading' } |
  { type: 'error', data: string[] }

const PrivateRoute: React.FC<PrivateRouteProps> = (props: PrivateRouteProps) => {
  const auth = useAuth();
  const history = useHistory();
  const [state, dispatch] = useReducer((state: PrivateRouteState, action: PrivateRouteAction) => {
    switch (action.type) {
    case 'done loading':
      return { ready: true, errors: [] };
    case 'is loading':
      return { ready: false, errors: [] };
    case 'error':
      return { ready: false, errors: action.data }
    }
    return state;
  }, {
    ready: false,
    errors: []
  });

  useEffect(() => {
    dispatch({ type: 'is loading' });
    auth.check()?.then(() => {
      dispatch({ type: 'done loading' });
    }, e => {
      dispatch({ type: 'error', data: e });
    });
  }, [history.location.pathname]);

  if (state.errors.length === 0) {
    if (state.ready) {
      if (auth.isAuthenticated() && ((props.admin && auth.isEditor()) || !props.admin)) {
        return <Route {...props}>{props.children}</Route>;
      } else {
        return <Redirect to="/login"/>;
      }
    } else {
      return <h1>Loading...</h1>;
    }
  } else {
    return <>
      {state.errors.map(err => <Alert key={err} variant="danger">{err}</Alert>)}
    </>;
  }
};

export default PrivateRoute;
