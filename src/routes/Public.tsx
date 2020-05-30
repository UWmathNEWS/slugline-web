import React from "react";
import { renderRoutes } from "react-router-config";
import { RouteProps, Switch } from "react-router-dom";
import Home from "../home/Home";
import Login from "../auth/Login";
import IssuePage from "../issues/IssuePage";
import IssueList from "../issues/IssueList";

export const routes: RouteProps[] = [
  {
    path: "/",
    exact: true,
    component: Home,
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/issues/:issue_id",
    component: IssuePage,
  },
  {
    path: "/issues",
    exact: true,
    component: IssueList,
  },
];

const Public = () => {
  return (
    <Switch>
      {renderRoutes(routes)}
    </Switch>
  );
};

export default Public;
