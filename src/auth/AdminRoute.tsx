import React from "react";
import { useAuth } from "./AuthProvider";
import { RouteProps, Route, Redirect } from "react-router-dom";

const AdminRoute: React.FC<RouteProps> = (props: RouteProps) => {
    const auth = useAuth();
    if (auth.isEditor()) {
        return <Route {...props}>{props.children}</Route>;
    } else {
        // TODO: make 404 route
        return <Redirect to="/login" />;
    }
};

export default AdminRoute;
