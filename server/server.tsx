/**
 * Based on https://flaviocopes.com/react-server-side-rendering/
 */

import path from "path";
import fs from "fs";

import express, { Request, Response } from "express";
import proxy from "http-proxy-middleware";

import React from "react";
import ReactDOMServer from "react-dom/server";
import { StaticRouter, StaticRouterContext, matchPath } from "react-router";

import axios from "axios";

import { Auth, defaultAuthContext } from "../src/auth/Auth";
import { appFactory } from "../src/App";
import Public, { routes as publicRoutes } from "../src/routes/Public";
import { routes as dashRoutes } from "../src/routes/Dash";
import Error404 from "../src/shared/errors/Error404";
import { APIResponse, User } from "../src/shared/types";
import { ToastProvider } from "../src/shared/contexts/ToastContext";
import ToastContainer from "../src/shared/components/ToastContainer";

interface StaticRouterContextWithData<T = any> extends StaticRouterContext {
  data?: T;
}

const PORT = 3030;
const app = express();

const router = express.Router();

const serverAppWrapper: {
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

const PublicApp = appFactory(Public);
const Error404App = appFactory(Error404);

const serverRenderer = (req: Request, res: Response) => {
  const currentRoute = publicRoutes.find(route => matchPath(req.url, route));

  let context: StaticRouterContextWithData = {};

  const app = ReactDOMServer.renderToString(
    serverAppWrapper(PublicApp, req.url, context)
  );

  fs.readFile(path.resolve("./build/index.html"), "utf8", (err, html) => {
    if (err) {
      console.error(err);
      return res.status(500).send("An error occurred");
    }

    if (currentRoute === undefined || context.statusCode == 404) {
      return res
        .status(404)
        .send(
          html.replace(
            '<div id="root"></div>',
            `<div id="root">${ReactDOMServer.renderToString(
              serverAppWrapper(Error404App, req.url)
            )}</div>`
          ).replace(
            "{{TITLE}}",
            "Page Not Found | mathNEWS"
          )
        );
    }

    return res.send(
      html.replace('<div id="root"></div>', `<div id="root">${app}</div>`)
        .replace("{{TITLE}}", currentRoute.title ? `${currentRoute.title} | mathNEWS` : "mathNEWS - description")
    );
  });
};

const dashRenderer = (req: Request, res: Response) => {
  axios
    .get<APIResponse<User | null>>("http://localhost:8000/api/me")
    .then(({ data }) => {
      if (data.success) {
        fs.readFile(path.resolve("./build/index.html"), "utf8", (err, html) => {
          if (err) {
            console.error(err);
            return res.status(500).send("An error occurred");
          }

          if (data.data) {
            // user is authenticated

            // check if 404
            if (
              dashRoutes.find((route) =>
                matchPath(req.url.replace("/dash", ""), route)
              )
            ) {
              res.status(404);
            }

            return res.send(html);
          } else {
            return res
              .status(404)
              .send(
                html
                  .replace(
                    '<div id="root"></div>',
                    `<div id="root">${ReactDOMServer.renderToString(
                      serverAppWrapper(Error404App, req.url)
                    )}</div>`
                  )
                  .replace(
                    "window.__SSR_DIRECTIVES__={}",
                    "window.__SSR_DIRECTIVES__={NO_PRELOAD_ROUTE:1}"
                  )
              );
          }
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send("An error occurred");
    });
};

// base path needs to be the first path as there already exists an index.html in static
router.use("^/$", serverRenderer);

router.use(
  express.static(path.resolve(__dirname, "..", "build"), { maxAge: "30d" })
);

// route API to Django --- dev use only
router.use(
  "^/api",
  proxy({ target: "http://localhost:8000", changeOrigin: true })
);

router.use("^/dash", dashRenderer);

router.use("^/", serverRenderer);

app.use(router);

app.listen(PORT, () => {
  console.log(`SSR running on port ${PORT}`);
});
