import React from "react";
import { useRouteMatch, Switch, Route } from "react-router-dom";
import Loader from "../shared/components/Loader";
import PrivateRoute from "../auth/PrivateRoute";

const DashArticlesPage = React.lazy(() => import("./articles/DashArticlesPage"));
const EditorPage = React.lazy(() => import("./EditorPage"));
const DashIssuesPage = React.lazy(() => import("./issues/DashIssuesPage"));
const DashIssueDetail = React.lazy(() => import("./issues/DashIssueDetail"));
const Profile = React.lazy(() => import("../profile/Profile"));
const AdminPanel = React.lazy(() => import("../admin/Admin"));

const Dash = () => {
  const match = useRouteMatch();

  return (
    <React.Suspense fallback={<Loader variant="spinner" />}>
      <Switch>
        <Route path={`${match.path}/edit/:articleId`}>
          <EditorPage />
        </Route>
        <Route path={`${match.path}/issues/:issueId`}>
          <DashIssueDetail />
        </Route>
        <Route path={`${match.path}/issues`}>
          <DashIssuesPage />
        </Route>
        <Route path={`${match.path}/articles`}>
          <DashArticlesPage />
        </Route>
        <Route path={`${match.path}/profile`}>
          <Profile />
        </Route>
        <PrivateRoute admin={true} path={`${match.path}/admin`}>
          <AdminPanel />
        </PrivateRoute>
        <Route exact path={`${match.path}/`}>
          <DashArticlesPage />
        </Route>
      </Switch>
    </React.Suspense>
  );
};

export default Dash;
