import React from "react";
import "./styles/slugline.scss";
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
import { BaseVisor } from "./shared/components/Visor";
import Help from "./routes/Help";

initLibrary();

const protectedRoutes: RegExp[] = [/^\/dash/];

interface AppProps {
  history?: History;
}

export const appFactory = <P extends any = {}>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: React.PropsWithChildren<P>) => (
    <>
      <BaseVisor />
      <SluglineNav />
      <div className="container">
        <div>
          <Component {...props} />
        </div>
      </div>
    </>
  );
};

const MainApp: React.FC = () => (
  <Switch>
    <PrivateRoute path="/dash">
      <Dash />
    </PrivateRoute>
    <Route path="/help">
      <Help />
    </Route>
    <Route path="/">
      <Public />
    </Route>
  </Switch>
);

const BaseApp: React.FC = appFactory(MainApp);

const BaseAppWrapper: React.FC<Required<AppProps>> = ({ history }) => {
  const auth = useAuth();

  React.useEffect(() => {
    const unlisten = history.listen((loc) => {
      if (protectedRoutes.some((matcher) => matcher.test(loc.pathname))) {
        // we no-op on error to prevent a crash as the error is handled by PrivateRoute
        auth.check(true).catch(() => {});
      }
    });

    return () => {
      unlisten();
    };
  }, [history, auth]);

  return <BaseApp />;
};

const BrowserApp: React.FC<AppProps> = ({
  history = createBrowserHistory(),
}) => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router history={history}>
          <BaseAppWrapper history={history} />
        </Router>
        <ToastContainer />
      </ToastProvider>
    </AuthProvider>
  );
};

export default BrowserApp;
