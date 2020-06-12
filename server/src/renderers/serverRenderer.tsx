import { Request, Response } from "express";
import { routes as publicRoutes } from "../../../src/routes/Public";
import { matchPath } from "react-router";
import { StaticRouterContextWithData, User } from "../../../src/shared/types";
import ReactDOMServer from "react-dom/server";
import {
  BUILD_DIR,
  renderHelmet,
  serverAppWrapper,
  PublicApp,
  ErrorApp,
} from "../helpers";
import fs from "fs";
import path from "path";
import serialize from "serialize-javascript";
import api from "../../../src/api/api";

const serverRenderer = (req: Request, res: Response) => {
  const currentRoute = publicRoutes.find((route) => matchPath(req.url, route));

  let context: StaticRouterContextWithData = {};
  let promises = [
    api.me.get({
      headers: { Cookie: req.header("cookie") || "" },
    }),
  ];
  let user: User | null = null;
  let data: any = null;

  if (currentRoute?.loadData) {
    const { params } = matchPath(req.url, currentRoute)!;
    promises.push(
      currentRoute.loadData({
        params,
        headers: { Cookie: req.header("cookie") || "" },
      })
    );
  }

  fs.readFile(
    path.resolve(BUILD_DIR, "index.html"),
    "utf8",
    async (err, html) => {
      if (err) {
        console.error(err);
        return res.status(500).send("An error occurred");
      }

      if (currentRoute === undefined || context.statusCode == 404) {
        const [userResp] = await Promise.all(promises);
        user = userResp.success ? userResp.data : null;

        return res
          .status(404)
          .send(
            html
              .replace(
                '<div id="root"></div>',
                `<div id="root">${ReactDOMServer.renderToString(
                  serverAppWrapper(ErrorApp, req.url, {}, { statusCode: 404 })
                )}</div>`
              )
              .replace("<title>{{HELMET}}</title>", renderHelmet)
              .replace(
                "window.__SSR_DIRECTIVES__={}",
                `window.__SSR_DIRECTIVES__={USER:${serialize(
                  user
                )}}`
              )
          );
      }

      const [userResp, ...additionalResps] = await Promise.all(promises);
      user = userResp.success ? userResp.data : null;

      if (currentRoute.loadData) {
        const [dataResp] = additionalResps;

        if (dataResp.success) {
          data = dataResp.data;
        } else {
          const statusCode = dataResp.statusCode;
          console.error(req.url, currentRoute, dataResp.error);

          return res.status(statusCode).send(
            html
              .replace(
                '<div id="root"></div>',
                `<div id="root">${ReactDOMServer.renderToString(
                  serverAppWrapper(ErrorApp, req.url, {}, { statusCode })
                )}</div>`
              )
              .replace("<title>{{HELMET}}</title>", renderHelmet)
              .replace(
                "window.__SSR_DIRECTIVES__={}",
                `window.__SSR_DIRECTIVES__={USER:${
                  serialize(user)
                },STATUS_CODE:${
                  dataResp.statusCode
                },ERROR:${serialize(dataResp.error)}}`
              )
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
            `window.__SSR_DIRECTIVES__={USER:${serialize(
              user
            )},DATA:${serialize(data)}}`
          )
      );
    }
  );
};

export default serverRenderer;
