import React from "react";
import { Route, Switch } from "react-router-dom";
import Login from "../auth/Login";
import IssuePage from "../issues/IssuePage";
import IssuesList from "../issues/IssueList";

const Public = () => {
  return (
    <Switch>
      <Route exact path="/">
        HOME CONTENT
      </Route>
      <Route path="/login">
        <Login/>
      </Route>
      <Route path="/issues/:issue_id">
        <IssuePage/>
      </Route>
      <Route path="/issues">
        <IssuesList />
      </Route>
    </Switch>
  )
};

export default Public;
