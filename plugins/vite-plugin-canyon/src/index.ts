import {Plugin, createLogger} from 'vite';
import picocolors from 'picocolors';

const {green} = picocolors;

export interface canyonPluginOptions {
  commitSha?: string;
  projectID?: string;
  compareTarget?: string;
  dsn?: string;
  reporter?: string;
  instrumentCwd?: string;
  branch?: string;
}

// Custom extensions to include .vue files
const DEFAULT_EXTENSION = ['.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx', '.vue'];
const PLUGIN_NAME = 'vite:canyon';

function resolveFilename(id: string): string {
  // To remove the annoying query parameters from the filename
  const [filename] = id.split('?vue');
  return filename;
}

function shouldInstrument(filename: string) {
  return DEFAULT_EXTENSION.some(ext => filename.endsWith(ext));
}

function instrumentedData(args: canyonPluginOptions): string {
  const canyon = {
    // gitlab流水线自带
    projectID: args.projectID || process.env['CI_PROJECT_ID'] || '',
    commitSha: args.commitSha || process.env['CI_COMMIT_SHA'] || '',
    sha: args.commitSha || process.env['CI_COMMIT_SHA'] || '',
    branch: args.branch || process.env['CI_COMMIT_BRANCH'] || process.env['CI_COMMIT_REF_NAME'] ||'',
    // 自己配置
    dsn: args.dsn || process.env['DSN'] || '',
    reporter: args.reporter || process.env['REPORTER'] || '',
    // 可选
    compareTarget: args.compareTarget,
    // 自动获取
    instrumentCwd: args.instrumentCwd || process.cwd(),
  }
  return `(new Function("return this")()).__canyon__ = ${JSON.stringify(canyon)}`;
}

export default function canyonPlugin(opts: canyonPluginOptions = {}): Plugin {
  const logger = createLogger('info', {prefix: 'vite-plugin-canyon'});
  const canyonStr = instrumentedData(opts);
  // logger.warn(`${PLUGIN_NAME}> ${green(`instrumented data: ${canyonStr}`)}`);
  return {
    name: PLUGIN_NAME,
    enforce: 'post',
    transform(srcCode, id, options) {
      const newCode = `${canyonStr}\n${srcCode}`
      const filename = resolveFilename(id);
      if (shouldInstrument(filename)) {
        return {
          code: newCode,
          map: null,
        };
      }
    },
  };
}
