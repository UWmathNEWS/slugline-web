/**
 * goosePRESS is a news publishing platform.
 * Copyright (C) 2020-2021  Kevin Trieu, Terry Chen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from "react";
import "./styles/primary_style.scss";
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
import { ThemeProvider } from "./shared/contexts/ThemeContext";

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
      <Component {...props} />
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
      <ThemeProvider>
        <ToastProvider>
          <Router history={history}>
            <BaseAppWrapper history={history} />
          </Router>
          <ToastContainer />
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default BrowserApp;
