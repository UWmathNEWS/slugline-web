import type React from "react";
import Home from "../home/Home";
import Login from "../auth/Login";
import IssuePage from "../issues/IssuePage";
import IssueList from "../issues/IssuesList";
import Error404 from "../shared/errors/Error404";
import { renderRoutes } from "../shared/helpers";
import type { RouteProps } from "../shared/types";
import api from "../api/api";

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
    loadData: ({ params, headers }) =>
      api.issues.get({
        id: params.issue_id,
        headers,
      }),
  },
  {
    path: "/issues",
    exact: true,
    component: IssueList,
    title: "Issues",
    loadData: ({ headers }) => api.issues.list({ headers }),
  },
  {
    component: Error404,
    title: "",
  },
];

const Public: React.FC = () => {
  return renderRoutes(routes);
};

export default Public;
