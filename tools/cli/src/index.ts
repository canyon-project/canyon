import { program } from "commander";
import { version } from "../package.json";
import { mapCommand } from "./commands/upload.ts";
import { logger } from "./utils/logger";

function accent(text: string): string {
  return `\x1b[92m${text}\x1b[0m`;
}

function alphaBadge(text: string): string {
  return `\x1b[30;103;1m ${text} \x1b[0m`;
}

/**
 *
 * @param {string} version
 * @returns {string}
 */
export function generateHeader(version: string): string {
  return `
   _____
  / ____|
 | |      __ _ _ __  _   _  ___  _ __
 | |     / _\` | '_ \\| | | |/ _ \\| '_ \\
 | |____| (_| | | | | |_| | (_) | | | |
  \\_____|\\__,_|_| |_|\\__, |\\___/|_| |_|
                      __/ |
                     |___/

  Canyon CLI ${version}
`;
}

const CLI_BEFORE_ALL_TXT = `canyon: The ${accent("Canyon")} CLI - Version ${version} (${accent(
  "https://github.com/canyon-project/canyon",
)}) ${alphaBadge("ALPHA")} \n`;

const CLI_AFTER_ALL_TXT = `\nFor more help, head on to ${accent(
  "https://github.com/canyon-project/canyon",
)}`;

program
  .name("canyon")
  .version(version, "-v, --version", "see the current version of canyon-uploader")
  .usage("[options or commands] arguments")
  .addHelpText("beforeAll", CLI_BEFORE_ALL_TXT)
  .addHelpText("after", CLI_AFTER_ALL_TXT)
  .configureHelp({
    optionTerm: (option) => accent(option.flags),
    subcommandTerm: (cmd) => accent(`${cmd.name()} ${cmd.usage()}`.trim()),
    argumentTerm: (arg) => accent(arg.name()),
  })
  .showHelpAfterError(true);

program.hook("preAction", () => {
  logger.info(generateHeader(version).trim());
});

program
  .command("upload")
  .option("--debug <dsn>", "debug")
  .option("--dsn <dsn>", "dsn of the canyon server")
  .option("--repo_id <repo_id>", "repo id of the canyon server")
  .option("--coverage-dir <coverage_dir>", "覆盖率目录，默认 .canyon_output")
  .option("--filter <filter>", "仅合并路径包含该子串的文件覆盖率")
  .option("--instrument_cwd <instrument_cwd>", "instrument cwd of the canyon server")
  .option("--sha <sha>", "sha of the canyon server")
  .option("--branch <branch>", "branch of the canyon server")
  .option("--provider <provider>", "provider of the canyon server")
  .option("--build_target <build_target>", "build target of the canyon server")
  .option("--coverage <coverage>", "coverage of the canyon server")
  .option(
    "--scene <key=value>",
    "scene key-value pair, can be used multiple times, e.g. --scene env=prod --scene type=e2e",
    (value, previous: string[] = []) => {
      previous.push(value);
      return previous;
    },
    [],
  )
  .allowExcessArguments(false)
  .allowUnknownOption(false)
  .description("modify react native project code to adapt to canyon")
  .addHelpText(
    "after",
    `\nFor help, head on to ${accent("https://github.com/canyon-project/canyon")}`,
  )
  .action(async (params, options) => await mapCommand(params, options));

export const cli = async (args: string[]) => {
  try {
    await program.parseAsync(args);
  } catch (e) {
    logger.error(e);
  }
};
