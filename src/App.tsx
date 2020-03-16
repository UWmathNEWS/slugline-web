import React from "react";
import "./slugline.scss";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import IssuesList from "./issues/IssuesList";
import IssuePage from "./issues/IssuePage";
import { AuthProvider } from "./auth/AuthProvider";
import Login from "./auth/Login";
import PrivateRoute from "./auth/PrivateRoute";
import Dash from "./dash/Dash";
import { initLibrary } from "./shared/icons";
import SluglineNav from "./header/SluglineNav";

initLibrary();

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SluglineNav />
        <div className="container">
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
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
