import React from "react";
import { Route, RouteComponentProps, Switch } from "react-router";
import { RouteProps } from "../types";

const renderRoutes: {
  (
    basePath: string,
    routes: RouteProps[],
    extraProps?: any,
    switchProps?: any
  ): React.ReactElement;
  (
    routes: RouteProps[],
    extraProps?: any,
    switchProps?: any
  ): React.ReactElement;
} = (
  basePath: any,
  routes: any = {},
  extraProps: any = {},
  switchProps: any = {}
): any => {
  // shuffle arguments if we didn't receive a basePath
  if (typeof basePath !== "string") {
    switchProps = extraProps;
    extraProps = routes;
    routes = basePath;
    basePath = "";
  }

  return (
    <Switch {...switchProps}>
      {routes.map(
        (
          {
            routeComponent: RouteComponent = Route,
            routeProps = {},
            ...route
          }: RouteProps,
          i: number
        ) => (
          <RouteComponent
            key={route.key || i}
            path={`${basePath}${route.path}`}
            exact={route.exact}
            strict={route.strict}
            render={(props: RouteComponentProps) =>
              "render" in route ? (
                route.render({ ...props, ...extraProps, route: route })
              ) : (
                <route.component {...props} {...extraProps} route={route} />
              )
            }
            {...routeProps}
          />
        )
      )}
    </Switch>
  );
};

export default renderRoutes;
