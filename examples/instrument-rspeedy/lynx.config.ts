import {defineConfig} from '@lynx-js/rspeedy'

import {pluginQRCode} from '@lynx-js/qrcode-rsbuild-plugin'
import {pluginReactLynx} from '@lynx-js/react-rsbuild-plugin'
import {pluginTypeCheck} from '@rsbuild/plugin-type-check'

export default defineConfig({
  plugins: [
    pluginQRCode({
      schema(url) {
        return `${url}?fullscreen=true`
      },
    }),
    pluginReactLynx(),
    pluginTypeCheck(),
  ],
  // https://lynxjs.org/next/zh/api/rspeedy/rspeedy.tools.swc.html#toolsswc-property
  tools: {
    swc: {
      jsc: {
        experimental: {
          plugins: [
            [
              'swc-plugin-coverage-instrument',
              {}],

            [
              '@canyonjs/swc-plugin',
              {
                ci: true
              }],
          ]
        }
      }
    }
  }
})
