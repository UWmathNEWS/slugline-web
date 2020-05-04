import React from "react";
import { useRouteMatch, Switch, Route } from "react-router-dom";
import DashArticlesPage from "./DashArticlesPage";
import EditorPage from "./EditorPage";
import DashIssuesPage from "./DashIssuesPage";

const Dash = () => {
  const match = useRouteMatch();

  return (
    <Switch>
      <Route path={`${match.path}/edit/:articleId`}>
        <EditorPage />
      </Route>
      <Route path={`${match.path}/issues/`}>
        <DashIssuesPage />
      </Route>
      <Route exact path={`${match.path}/`}>
        <DashArticlesPage />
      </Route>
    </Switch>
  );
};

export default Dash;
