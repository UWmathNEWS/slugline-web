#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const glob = require("glob");
const rimraf = require("rimraf");
const babel = require("@babel/core");

const clientSrcPath = path.resolve(__dirname, "..", "src");
const clientLibPath = path.resolve(__dirname, "..", "lib");
const serverSrcPath = path.resolve(__dirname, "..", "server", "src");
const serverLibPath = path.resolve(__dirname, "..", "server", "lib");

const write = (...msg) => {
  process.stdout.write(msg.join(" "));
};

const log = (logMethod, ...message) => {
  const now = new Date();
  logMethod(
    `[${now
      .getHours()
      .toString()
      .padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${now
      .getSeconds()
      .toString()
      .padStart(2, "0")}.${now
      .getMilliseconds()
      .toString()
      .padStart(3, "0")}] `,
    ...message
  );
};

const asyncRimraf = (...args) => {
  return new Promise((res, rej) => {
    rimraf(...args, (err) => {
      if (err) return rej(err);
      res();
    });
  });
};

const makeDirs = async (files, root = "") => {
  for (let i = files.length - 1; i >= 0; --i) {
    // Reverse iteration gives a greater chance of a directory hit with recursive mkdir, assuming the files array
    // is sorted
    const dir = path.resolve(root, path.dirname(files[i]));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
};

const transpileSources = async (
  sourceDir,
  outDir,
  files,
  logMessage = "",
  transformer = null,
  outExt = ".js"
) => {
  const promises = new Array(files.length);
  const logLabel = logMessage.replace("{}", files.length);
  let i = 0;

  await makeDirs(files, outDir);

  console.time(logLabel);
  for (const file of files) {
    promises[i] = babel
      .transformFileAsync(path.resolve(sourceDir, file))
      .then((result) => {
        const code = transformer(result.code, file);

        fs.writeFile(
          path.resolve(outDir, file.replace(/\.\w+$/, outExt)),
          code,
          (err) => {
            if (err) throw err;
          }
        );
      })
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });
    ++i;
  }

  return Promise.all(promises).then(() => {
    log(write, "");
    console.timeEnd(logLabel);
  });
};

/**
 * Generate lib files for the client
 */
const libClient = async () => {
  log(console.log, "CLIENT: Starting client lib generation");
  console.time("Finished client lib generation");

  let steps = [];

  // Set NODE_ENV manually if not set as babel-preset-react-app depends on it
  if (!process.env.NODE_ENV) {
    log(
      console.log,
      "CLIENT: INFO: NODE_ENV was empty, setting NODE_ENV=production"
    );
    process.env.NODE_ENV = "production";
  }

  // (1) remove the lib directories, if they exist
  if (fs.existsSync(clientLibPath)) {
    await asyncRimraf(clientLibPath);
  }
  await fs.promises.mkdir(clientLibPath);

  // (2) copy non-source files, so imports don't error out
  steps.push(
    new Promise((res) => {
      glob(
        "**/*.!(ts|tsx|svg)",
        { cwd: clientSrcPath, nodir: true },
        async (err, files) => {
          if (err) throw err;

          // ignore test files
          files = files.filter(
            (p) => !p.includes("__tests__") && !p.includes("__mocks__")
          );

          await makeDirs(files, clientLibPath);

          const promises = new Array(files.length);
          const logLabel = `Copied ${files.length} non-source files`;
          let i = 0;

          console.time(logLabel);
          for (const file of files) {
            promises[i] = new Promise((res) => {
              fs.copyFile(
                path.resolve(clientSrcPath, file),
                path.resolve(clientLibPath, file),
                (err) => {
                  if (err) throw err;
                  res();
                }
              );
            });
            ++i;
          }

          Promise.all(promises).then(() => {
            log(write, "CLIENT: ");
            console.timeEnd(logLabel);
            res();
          });
        }
      );
    })
  );

  // (3) run babel on the typescript source files
  babel.loadPartialConfig({
    configFile: path.resolve(__dirname, "..", ".babelrc.json"),
  });

  steps.push(
    new Promise((res) => {
      glob("**/*.{ts,tsx}", { cwd: clientSrcPath }, (err, files) => {
        if (err) throw err;

        // ignore test files
        files = files.filter(
          (p) => !p.includes("__tests__") && !p.includes("__mocks__")
        );

        transpileSources(
          clientSrcPath,
          clientLibPath,
          files,
          "CLIENT: Compiled {} source files",
          (code, file) => {
            // Replace calls to ESM exports with calls to CommonJS exports
            code = code.replace(
              /@babel(\\\\|\/)runtime(\\\\|\/)helpers(\\\\|\/)esm/g,
              "@babel$1runtime$2helpers"
            );

            // Replace API root to point to backend
            if (file === "api/api.ts") {
              code = code.replace(
                "/*$ SLUGLINE_SERVER */",
                `/* BEGIN INJECT */ "${
                  process.env.SLUGLINE_SERVER || "http://localhost:8000"
                }" + /* END INJECT */`
              );
            }

            return code;
          }
        ).then(() => {
          res();
        });
      });
    })
  );

  // (4) run babel on svg files
  steps.push(
    new Promise((res) => {
      glob("**/*.svg", { cwd: clientSrcPath }, (err, files) => {
        if (err) throw err;

        // ignore test files
        files = files.filter(
          (p) => !p.includes("__tests__") && !p.includes("__mocks__")
        );

        transpileSources(
          clientSrcPath,
          clientLibPath,
          files,
          "CLIENT: Transformed {} SVG files",
          (code) => {
            // Replace calls to ESM exports with calls to CommonJS exports
            code = code.replace(
              /@babel(\\\\|\/)runtime(\\\\|\/)helpers(\\\\|\/)esm/g,
              "@babel$1runtime$2helpers"
            );

            return code;
          },
          ".svg"
        ).then(() => {
          res();
        });
      });
    })
  );

  return Promise.all(steps).then(() => {
    log(write, "CLIENT: ");
    console.timeEnd("Finished client lib generation");
  });
};

/**
 * Generate lib files for the server
 */
const libServer = async () => {
  log(console.log, "SERVER: Starting server lib generation");
  console.time("Finished server lib generation");

  let steps = [];

  // (1) remove the lib directories, if they exist
  if (fs.existsSync(serverLibPath)) {
    await asyncRimraf(serverLibPath);
  }
  await fs.promises.mkdir(serverLibPath);

  // (2) run babel on the typescript source files
  babel.loadPartialConfig({
    configFile: path.resolve(__dirname, "..", "server", ".babelrc.json"),
  });

  steps.push(
    new Promise((res) => {
      glob("**/*.{ts,tsx}", { cwd: serverSrcPath }, (err, files) => {
        if (err) throw err;

        // ignore test files
        files = files.filter(
          (p) => !p.includes("__tests__") && !p.includes("__mocks__")
        );

        transpileSources(
          serverSrcPath,
          serverLibPath,
          files,
          "SERVER: Compiled {} source files",
          (code) => code.replace(/(?<=require\(.+)(\\\\|\/)src/g, "$1lib")
        ).then(() => {
          res();
        });
      });
    })
  );

  return Promise.all(steps).then(() => {
    log(write, "SERVER: ");
    console.timeEnd("Finished server lib generation");
  });
};

const args = process.argv.slice(2);

if (args.length === 0) {
  log(console.log, "INFO: Generating client and server libs");
  console.time("Finished lib generation");
  Promise.all([libClient(), libServer()]).then(() => {
    log(write, "INFO: ");
    console.timeEnd("Finished lib generation");
  });
}

if (args.includes("client")) {
  libClient();
}

if (args.includes("server")) {
  libServer();
}
