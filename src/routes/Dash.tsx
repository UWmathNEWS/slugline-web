import React from "react";
import { useRouteMatch } from "react-router-dom";
import Loader from "../shared/components/Loader";
import PrivateRoute from "../auth/PrivateRoute";
import { renderRoutes } from "../shared/helpers";
import Error404 from "../shared/errors/Error404";
import { RouteProps } from "../shared/types";

const DashArticlesPage = React.lazy(() =>
  import("../dash/articles/DashArticlesPage")
);
const EditorPage = React.lazy(() => import("../dash/EditorPage"));
const DashIssuesPage = React.lazy(() =>
  import("../dash/issues/DashIssuesPage")
);
const DashIssueDetail = React.lazy(() =>
  import("../dash/issues/DashIssueDetail")
);
const Profile = React.lazy(() => import("../profile/Profile"));
const AdminPanel = React.lazy(() => import("../admin/Admin"));

export const routes: RouteProps[] = [
  {
    path: "/edit/:articleId",
    component: EditorPage,
    title: "Edit {} | Dash",
  },
  {
    path: "/issues/:issueId",
    component: DashIssueDetail,
    title: "v{}i{} | Dash",
  },
  {
    path: "/issues",
    component: DashIssuesPage,
    title: "Issues | Dash",
  },
  {
    path: "/articles",
    component: DashArticlesPage,
    title: "Articles | Dash",
  },
  {
    path: "/profile",
    component: Profile,
    title: "Profile | Dash",
  },
  {
    path: "/admin",
    component: AdminPanel,
    title: "Users | Dash",
    routeComponent: PrivateRoute,
    routeProps: {
      admin: true,
    },
  },
  {
    path: "/",
    exact: true,
    component: DashArticlesPage,
    title: "Dash",
  },
  {
    component: Error404,
    title: "",
  },
];

const Dash = () => {
  const match = useRouteMatch();

  return (
    <React.Suspense fallback={<Loader variant="spinner" />}>
      {renderRoutes(match.path, routes)}
    </React.Suspense>
  );
};

export default Dash;
