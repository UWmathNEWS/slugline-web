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
import { Route, Switch } from "react-router-dom";
import Login from "../src/auth/Login";
import IssuePage from "../src/issues/IssuePage";
import IssuesList from "../src/issues/IssueList";

const PORT = 3030;
const app = express();

const router = express.Router();

const ServerApp = appFactory(Public)

const serverRenderer = (req: Request, res: Response) => {
  console.log(req.url);

  const app = ReactDOMServer.renderToString(
    <Auth.Provider value={defaultAuthContext}>
      <StaticRouter location={req.url} context={{}}>
        {/*<ServerApp />*/}
        <Switch>
          <Route exact path="/">
            HOME CONTENT
          </Route>
          <Route path="/login">
            <Login/>
          </Route>
          <Route path="/issues/:issue_id">
            <IssuePage/>
          </Route>
          <Route path="/issues">
            <IssuesList />
          </Route>
        </Switch>
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

router.use(
  express.static(path.resolve(__dirname, "..", "build"), { maxAge: "30d" })
);

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
