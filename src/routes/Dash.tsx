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
    title: "Edit {}",
  },
  {
    path: "/issues/:issueId",
    component: DashIssueDetail,
    title: "Issue {}",
  },
  {
    path: "/issues",
    component: DashIssuesPage,
    title: "Issues",
  },
  {
    path: "/articles",
    component: DashArticlesPage,
    title: "Articles",
  },
  {
    path: "/profile",
    component: Profile,
    title: "Profile",
  },
  {
    path: "/admin",
    component: AdminPanel,
    title: "Users",
    routeComponent: PrivateRoute,
    routeProps: {
      admin: true,
    },
  },
  {
    path: "",
    exact: true,
    component: DashArticlesPage,
    title: "Dash",
  },
  {
    component: Error404,
    title: "Page Not Found",
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
