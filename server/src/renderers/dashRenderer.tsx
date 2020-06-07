import { Request, Response } from "express";
import axios from "axios";
import { APIResponse, User } from "../../../src/shared/types";
import fs from "fs";
import path from "path";
import {
  BUILD_DIR,
  renderHelmet,
  serverAppWrapper,
  Error404App,
} from "../helpers";
import { routes as dashRoutes } from "../../../src/routes/Dash";
import { matchPath } from "react-router";
import ReactDOMServer from "react-dom/server";

const dashRenderer = (req: Request, res: Response) => {
  axios
    .get<APIResponse<User | null>>("http://localhost:8000/api/me", {
      headers: {
        // Forward cookies
        Cookie: Object.entries(req.cookies || {})
          .map(([name, value]) => `${name}=${value}`)
          .join(";"),
      },
    })
    .then(({ data }) => {
      if (data.success) {
        fs.readFile(
          path.resolve(BUILD_DIR, "index.html"),
          "utf8",
          (err, html) => {
            if (err) {
              console.error(err);
              return res.status(500).send("An error occurred");
            }

            if (data.data) {
              // user is authenticated

              // check if 404
              if (
                dashRoutes.every((route) => matchPath(req.url, route) === null)
              ) {
                res.status(404);
              }

              return res.send(html.replace("{{HELMET}}", ""));
            } else {
              return res.status(404).send(
                html
                  .replace(
                    '<div id="root"></div>',
                    `<div id="root">${ReactDOMServer.renderToString(
                      serverAppWrapper(Error404App, req.url)
                    )}</div>`
                  )
                  .replace("{{HELMET}}", renderHelmet)
                  .replace(
                    "window.__SSR_DIRECTIVES__={}",
                    "window.__SSR_DIRECTIVES__={NO_PRELOAD_ROUTE:1}"
                  )
              );
            }
          }
        );
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send("An error occurred");
    });
};

export default dashRenderer;
