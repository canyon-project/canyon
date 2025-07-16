import { createInstrumenter } from 'istanbul-lib-instrument';
import type {RsbuildPlugin, RsbuildPluginAPI} from '@rsbuild/core';


export interface IstanbulPluginOptions {
  include?: string | string[];
  exclude?: string | string[];
  extension?: string | string[];
  requireEnv?: boolean;
  cypress?: boolean;
  checkProd?: boolean;
  forceBuildInstrument?: boolean;
  cwd?: string;
  nycrcPath?: string;
  generatorOpts?: any;
}

function resolveFilename(id: string): string {
  const [filename] = id.split('?vue');
  return filename;
}

export const pluginIstanbul = (
  opts: IstanbulPluginOptions = {},
): RsbuildPlugin => ({
  name: 'rsbuild-plugin-istanbul',
  async setup(api: RsbuildPluginAPI) {
    const instrumenter = createInstrumenter({
      // @ts-ignore
      coverageGlobalScopeFunc: false,
      coverageGlobalScope: 'globalThis',
      preserveComments: true,
      produceSourceMap: true,
      autoWrap: true,
      esModules: true,
      compact: false,
      generatorOpts: { ...opts?.generatorOpts },
    });

    api.transform({
      test: /\.(js|cjs|mjs|ts|tsx|jsx|vue)$/,
      enforce:'post'
      // @ts-ignore
    }, ({ code,resource }) => {

      const filename = resolveFilename(resource);
      if (filename.includes('node_modules')) return; // 排除 node_modules
      const instrumented = instrumenter.instrumentSync(code, filename, undefined);
      const resultMap = instrumenter.lastSourceMap();
      return { code: instrumented, map: resultMap };
    });
  },
});
