import React from "react";
import {
  Switch,
  Route,
  RouteProps as _RouteProps,
  RouteComponentProps,
} from "react-router";

interface RouteBaseProps extends Omit<_RouteProps, "render" | "component"> {
  title: string;
  key?: string | number;
  routeComponent?: React.ComponentType;
  routeProps?: any;
  loadData?: <T>() => Promise<T>;
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
};

export default renderRoutes;
