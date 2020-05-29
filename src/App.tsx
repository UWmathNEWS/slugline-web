import React, { Suspense } from "react";
import "./slugline.scss";
import { Router, Switch, Route } from "react-router-dom";
import { createBrowserHistory, History } from "history";

import { useAuth } from "./auth/Auth";
import { AuthProvider } from "./auth/AuthProvider";
import PrivateRoute from "./auth/PrivateRoute";
import { ToastProvider } from "./shared/contexts/ToastContext";
import ToastContainer from "./shared/components/ToastContainer";
import { initLibrary } from "./shared/icons";
import SluglineNav from "./header/SluglineNav";
import Loader from "./shared/components/Loader";

import "./slugline.scss";

const Login = React.lazy(() => import("./auth/Login"));
const IssuesList = React.lazy(() => import("./issues/IssuesList"));
const IssuePage = React.lazy(() => import("./issues/IssuePage"));
const Dash = React.lazy(() => import("./dash/Dash"));
const Profile = React.lazy(() => import("./profile/Profile"));
const AdminPanel = React.lazy(() => import("./admin/Admin"));

initLibrary();

const browserHistory = createBrowserHistory();

const protectedRoutes: RegExp[] = [
  /^\/dash/,
  /^\/profile/,
  /^\/admin/,
];

interface AppProps {
  history?: History;
}

const ContextlessApp: React.FC<Required<AppProps>> = ({ history }) => {
  const auth = useAuth();

  React.useEffect(() => {
    const unlisten = history.listen((loc) => {
      if (protectedRoutes.some(matcher => matcher.test(loc.pathname))) {
        // we no-op on error to prevent a crash as the error is handled by PrivateRoute
        auth.check(true).catch(() => {});
      }
    });

    return () => { unlisten() };
  }, [history, auth]);

  return (
    <Router history={history}>
      <SluglineNav />
      <div className="container">
        <div>
          <Suspense fallback={<Loader variant="spinner" />}>
          <Switch>
            <Route exact path="/">
              HOME CONTENT
            </Route>
            <Route path="/login">
              <Login />
            </Route>
            <Route path="/issues/:issue_id">
              <IssuePage />
            </Route>
            <Route path="/issues">
              <IssuesList />
            </Route>
            <PrivateRoute path="/dash">
              <Dash />
            </PrivateRoute>
            <PrivateRoute path="/profile">
              <Profile />
            </PrivateRoute>
            <PrivateRoute admin={true} path="/admin">
              <AdminPanel />
            </PrivateRoute>
          </Switch>
          </Suspense>
        </div>
      </div>
    </Router>
  );
};

export default ({ history = browserHistory }: AppProps) => (
  <AuthProvider>
    <ToastProvider>
      <ContextlessApp history={history} />
      <ToastContainer />
    </ToastProvider>
  </AuthProvider>
);
