#!/usr/bin/env node
"use strict";

const { cli } = require("../dist/index.cjs");

cli(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
