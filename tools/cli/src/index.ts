import chalk from 'chalk';
import { program } from 'commander';
import { version } from '../package.json';
// import { hitCommand } from "./commands/hit";
import { mapCommand } from './commands/upload.ts';

const accent = chalk.greenBright;

/**
 * * Program Default Configuration
 */
const CLI_BEFORE_ALL_TXT = `canyon: The ${accent(
  'Canyon',
)} CLI - Version ${version} (${accent(
  'https://github.com/canyon-project/canyon',
)}) ${chalk.black.bold.bgYellowBright(' ALPHA ')} \n`;

const CLI_AFTER_ALL_TXT = `\nFor more help, head on to ${accent(
  'https://github.com/canyon-project/canyon',
)}`;

program
  .name('canyon')
  .version(
    version,
    '-v, --version',
    'see the current version of canyon-uploader',
  )
  .usage('[options or commands] arguments')
  .addHelpText('beforeAll', CLI_BEFORE_ALL_TXT)
  .addHelpText('after', CLI_AFTER_ALL_TXT)
  .configureHelp({
    optionTerm: (option) => accent(option.flags),
    subcommandTerm: (cmd) => accent(cmd.name(), cmd.usage()),
    argumentTerm: (arg) => accent(arg.name()),
  })
  .showHelpAfterError(true);

/**
 * * CLI Commands with upload
 */
// upload --dsn=http://local/coverage/client --repo_id=$CI_PROJECT_ID --instrument_cwd=$CI_PROJECT_DIR --sha=$CI_COMMIT_SHA --branch=$CI_COMMIT_REF_NAME --provider=gitlab
program
  .command('upload')
  .option('--debug <dsn>', 'debug')
  .option('--dsn <dsn>', 'dsn of the canyon server')
  .option('--repo_id <repo_id>', 'repo id of the canyon server')
  .option('--filter <filter>', '仅合并路径包含该子串的文件覆盖率')
  .option(
    '--instrument_cwd <instrument_cwd>',
    'instrument cwd of the canyon server',
  )
  .option('--sha <sha>', 'sha of the canyon server')
  .option('--branch <branch>', 'branch of the canyon server')
  .option('--provider <provider>', 'provider of the canyon server')
  .option('--build_target <build_target>', 'build target of the canyon server')
  .option('--coverage <coverage>', 'coverage of the canyon server')
  .option(
    '--scene <scene>',
    'scene map in JSON format, e.g. \'{"key1":"value1","key2":"value2"}\'',
  )
  .allowExcessArguments(false)
  .allowUnknownOption(false)
  .description('modify react native project code to adapt to canyon')
  .addHelpText(
    'after',
    `\nFor help, head on to ${accent(
      'https://github.com/canyon-project/canyon',
    )}`,
  )
  .action(async (params, options) => await mapCommand(params, options));

export const cli = async (args: string[]) => {
  try {
    await program.parseAsync(args);
  } catch (e) {
    console.error(e);
  }
};
