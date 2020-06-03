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
    title: "",
  },
  {
    path: "/login",
    component: Login,
    title: "Login",
  },
  {
    path: "/issues/:issue_id",
    component: IssuePage,
    title: "v{}i{}",
  },
  {
    path: "/issues",
    exact: true,
    component: IssueList,
    title: "Issues",
  },
  {
    component: Error404,
    title: "Page Not Found",
  },
];

const Public = () => {
  return renderRoutes(routes);
};

export default Public;
