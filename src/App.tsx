import React from "react";
import "./slugline.scss";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import Header from "./header/Header";
import IssuesList from "./issues/IssuesList";
import IssuePage from "./issues/IssuePage";
import { AuthProvider } from "./auth/AuthProvider";
import Login from "./auth/Login";

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
            </Switch>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
