import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { BUILD_DIR } from "../helpers";
import { routes as otherRoutes } from "../../../src/routes/Help";
import { matchPath } from "react-router";
import api from "../../../src/api/api";
import serialize from "serialize-javascript";

const helpRenderer = (req: Request, res: Response) => {
  api.me
    .get({
      headers: {
        // Forward cookies
        Cookie: req.header("cookie") || "",
      },
    })
    .then((data) => {
      if (data.success) {
        fs.readFile(
          path.resolve(BUILD_DIR, "index.html"),
          "utf8",
          (err, html) => {
            if (err) {
              console.error(err);
              return res.status(500).send("An error occurred");
            }

            // check if 404
            if (
              otherRoutes.every((route) => matchPath(req.url, route) === null)
            ) {
              res.status(404);
            }

            return res.send(
              html
                .replace("{{HELMET}}", "")
                .replace(
                  "window.__SSR_DIRECTIVES__={}",
                  `window.__SSR_DIRECTIVES__={USER:${serialize(data.data)}}`
                )
            );
          }
        );
      } else {
        console.log(data.error);
        return res.status(500).send("An error occurred");
      }
    });
};

export default helpRenderer;
