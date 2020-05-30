/**
 * Based on https://flaviocopes.com/react-server-side-rendering/
 */

import path from "path";
import fs from "fs";

import express, { Request, Response } from "express";
import proxy from "http-proxy-middleware";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router";

import { Auth, defaultAuthContext } from "../src/auth/Auth";
import { appFactory } from "../src/App";
import Public from "../src/routes/Public";

const PORT = 3030;
const app = express();

const router = express.Router();

const ServerApp = appFactory(Public);

const serverRenderer = (req: Request, res: Response) => {
  const context = {};

  const app = ReactDOMServer.renderToString(
    <Auth.Provider value={defaultAuthContext}>
      <StaticRouter location={req.url} context={context}>
        <ServerApp />
      </StaticRouter>
    </Auth.Provider>
  );

  fs.readFile(path.resolve("./build/index.html"), "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("An error occurred");
    }
    return res.send(
      data.replace(
        '<div id="root"></div>',
        `<div id="root">${app}</div>`
      )
    );
  });
};

// base path needs to be the first path as there already exists an index.html in static
router.use("^/$", serverRenderer);

router.use(express.static(path.resolve(__dirname, "..", "build"), { maxAge: "30d" }));

// route API to Django --- dev use only
router.use("^/api", proxy({ target: "http://localhost:8000", changeOrigin: true }));

router.use("^/dash", (req, res) => {
  fs.readFile(path.resolve("./build/index.html"), "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("An error occurred");
    }
    return res.send(data);
  });
});

router.use("^/", serverRenderer);

app.use(router);

app.listen(PORT, () => {
  console.log(`SSR running on port ${PORT}`);
});
