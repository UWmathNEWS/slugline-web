/**
 * Based on https://flaviocopes.com/react-server-side-rendering/
 */

import express from "express";
import proxy from "http-proxy-middleware";
import morgan from "morgan";

import React from "react";
import { BUILD_DIR } from "./helpers";
import dashRenderer from "./renderers/dashRenderer";
import serverRenderer from "./renderers/serverRenderer";

const app = express();

app.use(morgan("combined"));

const router = express.Router();

// base path needs to be the first path as there already exists an index.html in static
router.use("^/$", serverRenderer);

router.use(express.static(BUILD_DIR, { maxAge: "30d" }));

// route API to Django --- dev use only
router.use(
  "^/api",
  proxy({
    target: process.env.SLUGLINE_SERVER || "http://localhost:8000",
    changeOrigin: true,
  })
);

router.use("^/dash", dashRenderer);

router.use("^/", serverRenderer);

app.use(router);

export default app;
