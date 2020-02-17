import React from "react";
import { useAuth } from "./AuthProvider";
import { RouteProps, Route, Redirect } from "react-router-dom";

const PrivateRoute: React.FC<RouteProps> = (props: RouteProps) => {
  const auth = useAuth();
  if (auth.isAuthenticated()) {
    return <Route {...props}>{props.children}</Route>;
  } else {
    return <Redirect to="/login" />;
  }
};

export default PrivateRoute;
