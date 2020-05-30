import React from "react";
import { useRouteMatch } from "react-router-dom";
import Loader from "../shared/components/Loader";
import PrivateRoute from "../auth/PrivateRoute";
import renderRoutes, { RouteProps } from "../shared/helpers/renderRoutes";
import Error404 from "../shared/errors/Error404";

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
  },
  {
    path: "/issues/:issueId",
    component: DashIssueDetail,
  },
  {
    path: "/issues",
    component: DashIssuesPage,
  },
  {
    path: "/articles",
    component: DashArticlesPage,
  },
  {
    path: "/profile",
    component: Profile,
  },
  {
    path: "/admin",
    component: AdminPanel,
    routeComponent: PrivateRoute,
    routeProps: {
      admin: true,
    },
  },
  {
    path: "",
    exact: true,
    component: DashArticlesPage,
  },
  {
    component: Error404,
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
