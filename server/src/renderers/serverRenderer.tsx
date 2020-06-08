import { Request, Response } from "express";
import { routes as publicRoutes } from "../../../src/routes/Public";
import { matchPath } from "react-router";
import { StaticRouterContextWithData } from "../../../src/shared/types";
import ReactDOMServer from "react-dom/server";
import {
  BUILD_DIR,
  renderHelmet,
  serverAppWrapper,
  PublicApp,
  Error404App,
  Error500App,
} from "../helpers";
import fs from "fs";
import path from "path";
import serialize from "serialize-javascript";
import { unwrap } from "../../../src/api/api";

const serverRenderer = (req: Request, res: Response) => {
  const currentRoute = publicRoutes.find((route) => matchPath(req.url, route));

  let context: StaticRouterContextWithData = {};
  let data: any = null;

  fs.readFile(
    path.resolve(BUILD_DIR, "index.html"),
    "utf8",
    async (err, html) => {
      if (err) {
        console.error(err);
        return res.status(500).send("An error occurred");
      }

      if (currentRoute === undefined || context.statusCode == 404) {
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
              .replace("<title>{{HELMET}}</title>", renderHelmet)
          );
      }

      if (currentRoute.loadData) {
        const { params } = matchPath(req.url, currentRoute)!;
        try {
          data = await unwrap(
            currentRoute.loadData({
              params,
              headers: { Cookie: req.header("cookie") || "" },
            })
          );
        } catch (err) {
          console.error(err);
          return res
            .status(500)
            .send(
              html
                .replace(
                  '<div id="root"></div>',
                  `<div id="root">${ReactDOMServer.renderToString(
                    serverAppWrapper(Error500App, req.url)
                  )}</div>`
                )
                .replace("<title>{{HELMET}}</title>", renderHelmet)
            );
        }
      }

      context.data = data;

      const app = ReactDOMServer.renderToString(
        serverAppWrapper(PublicApp, req.url, context)
      );

      return res.send(
        html
          .replace('<div id="root"></div>', `<div id="root">${app}</div>`)
          .replace("<title>{{HELMET}}</title>", renderHelmet)
          .replace(
            "window.__SSR_DIRECTIVES__={}",
            `window.__SSR_DIRECTIVES__={DATA:${serialize(data)}}`
          )
      );
    }
  );
};

export default serverRenderer;
