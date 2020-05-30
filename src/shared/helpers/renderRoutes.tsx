import React from "react";
import {
  Switch,
  Route,
  RouteProps as _RouteProps,
  RouteComponentProps,
} from "react-router";

interface RouteBaseProps extends Omit<_RouteProps, "render" | "component"> {
  key?: string | number;
  routeComponent?: React.ComponentType;
  routeProps?: any;
}

export type RouteProps = RouteBaseProps &
  (
    | {
        render: (
          props: RouteComponentProps<any> & { route: RouteProps }
        ) => React.ReactNode;
      }
    | {
        component:
          | React.ComponentType<
              RouteComponentProps<any> & { route: RouteProps }
            >
          | React.ComponentType<any>;
      }
  );

function renderRoutes(
  basePath: string,
  routes: RouteProps[],
  extraProps?: any,
  switchProps?: any
): React.ReactElement;
function renderRoutes(
  routes: RouteProps[],
  extraProps?: any,
  switchProps?: any
): React.ReactElement;
function renderRoutes(
  basePath: any,
  routes: any = {},
  extraProps: any = {},
  switchProps: any = {}
): any {
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
            path={route.path ? `${basePath}${route.path}` : route.path}
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
}

export default renderRoutes;
