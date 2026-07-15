# @canyonjs/babel-plugin

A Babel plugin for [Canyon](https://canyonjs.io). It instruments your source at build time, injecting coverage collection logic and Canyon metadata (repository, commit info, etc.), and works alongside the Istanbul toolchain.

Use it in any frontend project that compiles with Babel. If you use Vite, you can use [`@canyonjs/vite-plugin`](https://www.npmjs.com/package/@canyonjs/vite-plugin) instead, which reuses this plugin internally.

## Install

```sh
npm install -D @canyonjs/babel-plugin
```

## Documentation

Full details on options, CI auto-detection, and using it with `babel-plugin-istanbul` are in the official docs:

**https://docs.canyonjs.io/docs/ecosystem/babel-plugin**
