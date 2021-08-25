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
import config from "../config";
import { Issue, RouteProps } from "./types";
import { Route, RouteComponentProps, Switch } from "react-router";

import * as url from "./helpers/url";
import * as user from "./helpers/user";

export { url };
export { user };

/**
 * Formats a string using Python-style syntax without sanitizing its parameters.
 * NOT SAFE FOR PRODUCTION USE.
 *
 * @param fmtStr The format string
 * @param params Parameters to pass in to be formatted
 */
export const __unsafeRawFormat = (
  fmtStr: string,
  params?: Record<string | number, any> | any[]
): string => {
  if (!params) return fmtStr;

  // TODO: When TS 4.4 comes out, replace isArray checks with isParamsArray to take advantage of
  //  microsoft/TypeScript#44730
  // const isParamsArray = Array.isArray(params);
  const maxOffset = Array.isArray(params) ? params.length : 0;

  let strBuilder = [];
  let lastFmtStrInd = 0;
  let unlabelledMatches = 0;

  for (let i = 0, len = fmtStr.length; i < len; ) {
    if (
      (fmtStr[i] === "{" && fmtStr[i + 1] === "{") ||
      (fmtStr[i] === "}" && fmtStr[i + 1] === "}")
    ) {
      // handle escapes
      strBuilder.push(fmtStr.slice(lastFmtStrInd, i + 1));
      i += 2; // skip escape sequence
      lastFmtStrInd = i;
    } else if (fmtStr[i] === "{") {
      // regular interpolation
      // save everything up to this brace
      strBuilder.push(fmtStr.slice(lastFmtStrInd, i));
      lastFmtStrInd = i;

      // search for matching closing brace
      do {
        i += 1;
      } while (i < len && fmtStr[i] !== "{" && fmtStr[i] !== "}");

      if (fmtStr[i] === "}") {
        // success, matched brace
        const paramName = fmtStr.slice(lastFmtStrInd + 1, i);
        if (Array.isArray(params)) {
          // If params were given as an array, we want to accommodate empty idents and negative indices
          const ind = parseInt(paramName);
          let sub: string;
          if (!paramName) {
            // unlabelled format ident, fall back on last index seen
            sub = params[unlabelledMatches++];
          } else if (ind < 0 && ind >= -maxOffset) {
            // negative index, go from end of array
            sub = params[maxOffset + ind];
          } else if (0 <= ind && ind < maxOffset) {
            // positive index, treat as normal
            sub = params[ind];
          } else {
            // OOB or not a valid numeric index, don't substitute
            sub = `{${paramName}}`;
          }
          strBuilder.push(sub);
        } else {
          if (params.hasOwnProperty(paramName)) {
            strBuilder.push(params[paramName]);
          } else {
            strBuilder.push(`{${paramName}}`);
          }
        }
        lastFmtStrInd = i + 1;
      } else {
        // failure, unmatched brace or opening brace found, so we restart search here
        strBuilder.push(fmtStr.slice(lastFmtStrInd, i));
        lastFmtStrInd = i;
      }
    } else {
      i += 1;
    }
  }
  strBuilder.push(fmtStr.slice(lastFmtStrInd));

  return strBuilder.join("");
};

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
  <T extends string | number = string | number>(
    fmtStr: string,
    params: Record<T, any>
  ): string;
  (fmtStr: string, ...params: (string | number)[]): string;
} = (fmtStr: string, ...params: any[]) => {
  // If the only parameter is not of type number or string, treat it as a dictionary parameter
  const paramsObj =
    params.length === 1 &&
    typeof params[0] !== "number" &&
    typeof params[0] !== "string" &&
    params[0] !== undefined &&
    params[0] !== null
      ? params[0]
      : params;

  // If no parameters were given, just return the format string
  if (
    paramsObj.length === 0 ||
    Object.getOwnPropertyNames(paramsObj).length === 0
  ) {
    return fmtStr;
  }

  // Sanitize params before passing into __unsafeRawFormat
  // For now, this is commented out because I can't think of any sanitization we need at the moment

  // let safedParams: Record<string, string> | string[];

  // if (Array.isArray(paramsObj)) {
  //   safedParams = paramsObj.map((param) => param.toString());
  // } else {
  //   safedParams = {};
  //   for (const key in paramsObj) {
  //     if (paramsObj.hasOwnProperty(key)) {
  //       safedParams[key.toString()] = paramsObj[key].toString();
  //     }
  //   }
  // }

  return __unsafeRawFormat(fmtStr, paramsObj);
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
  if (title) {
    return `${format(title, ...params)} | ${config.title}`;
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
export const coverSrc = (issue: Issue, size: number, type?: "RGB" | "LA") =>
  issue.pdf +
  `.COVER-${type ?? (issue.colour === "paper" ? "RGB" : "LA")}-${size}x.png`;

/**
 * Does nothing.
 */
/* istanbul ignore next */
export const noop = () => {};
