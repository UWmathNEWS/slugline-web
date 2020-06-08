import React from "react";
import { StaticRouter, StaticRouterContext } from "react-router";
import { Auth, defaultAuthContext } from "../../src/auth/Auth";
import { ToastProvider } from "../../src/shared/contexts/ToastContext";
import ToastContainer from "../../src/shared/components/ToastContainer";
import path from "path";
import { Helmet } from "react-helmet";
import { appFactory } from "../../src/App";
import Error404 from "../../src/shared/errors/Error404";
import Error500 from "../../src/shared/errors/Error500";
import Public from "../../src/routes/Public";

export const BUILD_DIR = path.resolve(__dirname, "..", "..", "build");

export const serverAppWrapper: {
  <T extends StaticRouterContext = StaticRouterContext>(
    Component: React.ComponentType,
    location: string,
    context: T
  ): React.ReactElement;
  (Component: React.ComponentType, location: string): React.ReactElement;
} = (Component: any, location: any, context: any = {}) => {
  return (
    <Auth.Provider value={defaultAuthContext}>
      <ToastProvider>
        <StaticRouter
          location={location}
          context={context as StaticRouterContext}
        >
          <Component />
        </StaticRouter>
        <ToastContainer />
      </ToastProvider>
    </Auth.Provider>
  );
};

export const renderHelmet = () => {
  const helmet = Helmet.renderStatic();

  return `
  
  ${helmet.title.toString()}
  ${helmet.meta.toString()}
  ${helmet.link.toString()}
  ${helmet.script.toString()}
  ${helmet.style.toString()}
  
  `;
};

export const cookiesToString = (cookies: any) =>
  Object.entries(cookies || {})
    .map(([name, value]) => `${name}=${value}`)
    .join(";");

export const PublicApp = appFactory(Public);
export const Error404App = appFactory(Error404);
export const Error500App = appFactory(Error500);
