import React from "react";
import SluglineEditor from "../editor/SluglineEditor";
import { useRouteMatch, Switch, Route } from "react-router-dom";
import DashArticlesPage from "./DashArticlesPage";
import EditorPage from "./EditorPage";

const Dash = () => {
  const match = useRouteMatch();

  return (
    <Switch>
      <Route path={`${match.path}/edit/:articleId`}>
        <EditorPage />
      </Route>
      <Route path={`${match.path}/`}>
        <DashArticlesPage />
      </Route>
    </Switch>
  );
};

export default Dash;
