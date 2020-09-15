import Home from "../home/Home";
import Login from "../auth/Login";
import IssuePage from "../issues/IssuePage";
import IssueList from "../issues/IssuesList";
import Error404 from "../shared/errors/Error404";
import { renderRoutes } from "../shared/helpers";
import { RouteProps } from "../shared/types";
import api, { combine } from "../api/api";

export const routes: RouteProps[] = [
  {
    path: "/",
    exact: true,
    component: Home,
    title: "",
    loadData: ({ query, headers }) =>
      combine(
        api.published_issues.list({
          // For compatibility with Wordpress, we use the paged key instead of
          // the arguably more sensible page key
          params: { page: query?.paged || 1 },
          headers,
        }),
        api.published_issues.latest({ headers })
      ),
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
    loadData: ({ params = {}, headers }) =>
      api.published_issues.get({
        id: params.issue_id,
        headers,
      }),
  },
  {
    path: "/issues",
    exact: true,
    component: IssueList,
    title: "Issues",
    loadData: ({ headers }) => api.published_issues.list({ headers }),
  },
  {
    component: Error404,
    title: "",
  },
];

const Public = () => {
  return renderRoutes(routes);
};

export default Public;
