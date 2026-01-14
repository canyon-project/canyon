#!/usr/bin/env node

import('../dist/index.mjs').then((module) => {
  module.main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
});
