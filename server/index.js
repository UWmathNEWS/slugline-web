#!/usr/bin/env node

"use strict";

const app = require('./lib/server').default;

const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
  console.log(`SSR running on port ${PORT}`);
});
