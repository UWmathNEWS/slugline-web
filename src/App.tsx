import React from "react";
import "./slugline.scss";
import { Router, Switch, Route } from "react-router-dom";
import { Toast } from "react-bootstrap";
import { createBrowserHistory } from "history";

import Header from "./header/Header";
import IssuesList from "./issues/IssuesList";
import IssuePage from "./issues/IssuePage";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import Login from "./auth/Login";
import PrivateRoute from "./auth/PrivateRoute";
import Dash from "./dash/Dash";
import Profile from "./profile/Profile";
import AdminPanel from "./admin/Admin";
import { ToastProvider } from "./shared/contexts/ToastContext";
import ToastContainer from "./shared/components/ToastContainer";
import { initLibrary } from "./shared/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

initLibrary();

const history = createBrowserHistory();

const protectedRoutes = ['/dash', '/profile', '/admin'];

const App: React.FC = () => {
  const auth = useAuth();

  React.useEffect(() => {
    history.listen((loc) => {
      if (protectedRoutes.includes(loc.pathname)) {
        auth.check(true);
      }
    });
  }, []);

  return (
    <Router history={history}>
      <div className="container">
        <Header />
        <div>
          <Switch>
            <Route exact path="/">
              HOME CONTENT
            </Route>
            <Route path="/login">
              <Login />
            </Route>
            <Route path="/issues/:issue_id">
              <IssuePage />
            </Route>
            <Route path="/issues">
              <IssuesList />
            </Route>
            <PrivateRoute path="/dash">
              <Dash />
            </PrivateRoute>
            <PrivateRoute path="/profile">
              <Profile />
            </PrivateRoute>
            <PrivateRoute admin={true} path="/admin">
              <AdminPanel />
            </PrivateRoute>
          </Switch>
        </div>
      </div>
    </Router>
  );
};

export default () => (
  <AuthProvider>
    <ToastProvider>
      <App />
      <ToastContainer />
    </ToastProvider>
  </AuthProvider>
);
