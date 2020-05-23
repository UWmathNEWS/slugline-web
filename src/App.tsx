import React from "react";
import "./slugline.scss";
import { Router, Switch, Route } from "react-router-dom";
import { createBrowserHistory, History } from "history";

import IssuesList from "./issues/IssuesList";
import IssuePage from "./issues/IssuePage";
import { useAuth } from "./auth/Auth";
import { AuthProvider } from "./auth/AuthProvider";
import Login from "./auth/Login";
import PrivateRoute from "./auth/PrivateRoute";
import Dash from "./dash/Dash";
import Profile from "./profile/Profile";
import AdminPanel from "./admin/Admin";
import { ToastProvider } from "./shared/contexts/ToastContext";
import ToastContainer from "./shared/components/ToastContainer";
import { initLibrary } from "./shared/icons";
import SluglineNav from "./header/SluglineNav";

import "./slugline.scss";

initLibrary();

const browserHistory = createBrowserHistory();

const protectedRoutes = ["/dash", "/profile", "/admin"];

interface AppProps {
  history?: History;
}

const ContextlessApp: React.FC<AppProps> = ({ history }) => {
  const auth = useAuth();
  const hist = history ?? browserHistory;

  React.useEffect(() => {
    hist.listen((loc) => {
      if (protectedRoutes.includes(loc.pathname)) {
        auth.check(true);
      }
    });
  }, []);

  return (
    <Router history={hist}>
      <SluglineNav />
      <div className="container">
        <div>
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
        </div>
      </div>
    </Router>
  );
};

export default ({ history }: AppProps) => (
  <AuthProvider>
    <ToastProvider>
      <ContextlessApp history={history} />
      <ToastContainer />
    </ToastProvider>
  </AuthProvider>
);
