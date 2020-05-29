import React from "react";
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
import Public from "./routes/Public";
import Dash from "./routes/Dash";

initLibrary();

const protectedRoutes: RegExp[] = [
  /^\/dash/,
];

interface AppProps {
  history?: History;
}

export const appFactory = <T extends any = {}>(Component: React.ComponentType): React.FC<T> => {
  return (props: T) => (
    <>
      <SluglineNav />
      <div className="container">
        <div>
          <Component {...props} />
        </div>
      </div>
    </>
  );
};

const MainApp = () => (
  <Switch>
    <PrivateRoute path="/dash">
      <Dash />
    </PrivateRoute>
    <Route path="/">
      <Public />
    </Route>
  </Switch>
);

export const BaseApp: React.FC = appFactory(MainApp);

const BrowserApp: React.FC<AppProps> = ({ history = createBrowserHistory() }) => {
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
      <AuthProvider>
        <ToastProvider>
          <Router history={history}>
            <BaseApp />
          </Router>
          <ToastContainer />
        </ToastProvider>
      </AuthProvider>
    </Router>
  )
};

export default BrowserApp;
