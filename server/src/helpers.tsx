import React from "react";
import { StaticRouter, StaticRouterContext } from "react-router";
import { Auth, defaultAuthContext } from "../../src/auth/Auth";
import { ToastProvider } from "../../src/shared/contexts/ToastContext";
import ToastContainer from "../../src/shared/components/ToastContainer";
import path from "path";
import { Helmet } from "react-helmet";
import { appFactory } from "../../src/App";
import ErrorPage, { ErrorPageProps } from "../../src/shared/errors/ErrorPage";
import Public from "../../src/routes/Public";

export const BUILD_DIR = path.resolve(__dirname, "..", "..", "build");

export const serverAppWrapper: {
  <T extends StaticRouterContext = StaticRouterContext, U = any>(
    Component: React.ComponentType<U>,
    location: string,
    context: T,
    props?: U
  ): React.ReactElement;
  (Component: React.ComponentType, location: string): React.ReactElement;
} = (Component: any, location: any, context: any = {}, props: any = {}) => {
  return (
    <Auth.Provider value={defaultAuthContext}>
      <ToastProvider>
        <StaticRouter
          location={location}
          context={context as StaticRouterContext}
        >
          <Component {...props} />
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

export const PublicApp = appFactory(Public);
export const ErrorApp = appFactory<ErrorPageProps>(ErrorPage);
