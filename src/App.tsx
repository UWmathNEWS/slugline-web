import React from "react";
import "./slugline.scss";
import { Router, Switch, Route } from "react-router-dom";
import { createBrowserHistory, Location } from "history";

import Header from "./header/Header";
import IssuesList from "./issues/IssuesList";
import IssuePage from "./issues/IssuePage";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import Login from "./auth/Login";
import PrivateRoute from "./auth/PrivateRoute";
import AdminRoute from "./auth/AdminRoute";
import Dash from "./dash/Dash";
import AdminPanel from "./admin/Admin";
import { initLibrary } from "./shared/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

initLibrary();

const history = createBrowserHistory();

const App: React.FC = () => {
  const auth = useAuth();

  history.listen(() => {
    auth.check(true);
  });

  return (
    <Router history={history}>
      <div className="container">
        <Header/>
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
            <AdminRoute path="/admin">
              <AdminPanel />
            </AdminRoute>
          </Switch>
        </div>
      </div>
    </Router>
  );
};

export default () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);
