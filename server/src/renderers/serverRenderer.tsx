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
} from "../helpers";
import fs from "fs";
import path from "path";

const serverRenderer = (req: Request, res: Response) => {
  const currentRoute = publicRoutes.find((route) => matchPath(req.url, route));

  let context: StaticRouterContextWithData = {};

  const app = ReactDOMServer.renderToString(
    serverAppWrapper(PublicApp, req.url, context)
  );

  fs.readFile(path.resolve(BUILD_DIR, "index.html"), "utf8", (err, html) => {
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
            .replace("{{HELMET}}", renderHelmet)
        );
    }

    return res.send(
      html
        .replace('<div id="root"></div>', `<div id="root">${app}</div>`)
        .replace("{{HELMET}}", renderHelmet)
    );
  });
};

export default serverRenderer;
