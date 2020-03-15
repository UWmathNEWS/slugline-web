import React from "react";
import "./slugline.scss";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import Header from "./header/Header";
import IssuesList from "./issues/IssuesList";
import IssuePage from "./issues/IssuePage";
import { AuthProvider } from "./auth/AuthProvider";
import Login from "./auth/Login";
import PrivateRoute from "./auth/PrivateRoute";
import Dash from "./dash/Dash";
import { initLibrary } from "./shared/icons";

initLibrary();

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
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
            </Switch>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
