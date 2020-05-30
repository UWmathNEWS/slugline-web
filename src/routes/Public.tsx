import React from "react";
import Home from "../home/Home";
import Login from "../auth/Login";
import IssuePage from "../issues/IssuePage";
import IssueList from "../issues/IssuesList";
import Error404 from "../shared/errors/Error404";
import renderRoutes, { RouteProps } from "../shared/helpers/renderRoutes";

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
  {
    component: Error404,
  },
];

const Public = () => {
  return renderRoutes(routes);
};

export default Public;
