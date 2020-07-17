import React from "react";
import { useRouteMatch } from "react-router-dom";
import Loader from "../shared/components/Loader";
import { renderRoutes } from "../shared/helpers";
import { RouteProps } from "../shared/types";

const PasswordReset = React.lazy(() =>
  import(/* webpackChunkName: "other-reset-password" */ "../auth/PasswordReset")
);

export const routes: RouteProps[] = [
  {
    path: "/reset_password",
    component: PasswordReset,
    title: "Reset Password",
  },
];

const Help = () => {
  const match = useRouteMatch();

  return (
    <React.Suspense fallback={<Loader variant="spinner" />}>
      {renderRoutes(match.path, routes)}
    </React.Suspense>
  );
};

export default Help;
