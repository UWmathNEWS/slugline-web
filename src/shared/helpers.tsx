import React from "react";
import config from "../config";
import { Issue, RouteProps } from "./types";
import { Route, RouteComponentProps, Switch } from "react-router";

import * as url from "./helpers/url";
export { url };

/**
 * Formats a string using Python-style syntax.
 *
 *     format("Hello, {}!", "world") // => Hello, world!
 *     format("Hello, {name}!", { name: "world" }) // => Hello, world!
 *     format("Hello, {{name}}!, "world") // => Hello, {name}!
 *
 * @param fmtStr The format string
 * @param params Parameters to pass in to be formatted
 */
export const format: {
  (fmtStr: string): string;
  (fmtStr: string, params: Record<string | number, any>): string;
  (fmtStr: string, ...params: (string | number)[]): string;
} = (fmtStr: string, ...params: any[]) => {
  if (params.length === 0) return fmtStr;

  const paramsObj =
    typeof params[0] === "number" ||
    typeof params[0] === "string" ||
    typeof params[0] === "undefined"
      ? params
      : params[0];
  let unlabelledMatches = 0;

  return fmtStr.replace(/{([^}]*)}/g, (match, paramName, offset) => {
    if (!paramName) {
      return paramsObj[unlabelledMatches++];
    }
    if (paramName[0] === "{" && fmtStr[offset + match.length] === "}") {
      return paramName;
    }
    return paramsObj[
      parseInt(paramName) in paramsObj ? parseInt(paramName) : paramName
    ];
  });
};

/**
 * Returns a formatted document title. If called with two or more parameters, calls helpers.format on all parameters
 * to format the title, and returns a title of the form "{format} | {site title}". If called with one parameter,
 * returns a title of the form "{parameter} | {site title}". If called with zero parameters, returns a title of the
 * form "{site title} - {site description}". The site title and site description can be configured in config.ts as
 * config.title and config.description.
 *
 * @param title - The title of the current page.
 * @param params - Parameters to pass to helpers.format to format the page title.
 */
export const makeTitle = (title?: string, ...params: any[]) => {
  if (title && params.length > 0) {
    return `${format(title, ...params)} | ${config.title}`;
  } else if (title) {
    return `${title} | ${config.title}`;
  } else {
    return `${config.title} - ${config.description}`;
  }
};

export const renderRoutes: {
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

/**
 * Returns the appropriate URL to the cover image of an issue
 *
 * @param issue The issue to return the cover image for
 * @param size The size of image to link to
 * @param type The type of image to link to
 */
export const cover_src = (issue: Issue, size: number, type?: "RGB" | "LA") =>
  issue.pdf +
  `.COVER-${type ?? (issue.colour === "paper" ? "RGB" : "LA")}-${size}x.png`;
