import chalk from "chalk";
import { program } from "commander";
import { version } from "../package.json";
import { hitCommand } from "./commands/hit";
import { mapCommand } from "./commands/map";

const accent = chalk.greenBright;

/**
 * * Program Default Configuration
 */
const CLI_BEFORE_ALL_TXT = `canyon: The ${accent(
	"Canyon",
)} CLI - Version ${version} (${accent(
	"https://github.com/canyon-project/canyon",
)}) ${chalk.black.bold.bgYellowBright(" ALPHA ")} \n`;

const CLI_AFTER_ALL_TXT = `\nFor more help, head on to ${accent(
	"https://github.com/canyon-project/canyon",
)}`;

program
	.name("canyon")
	.version(
		version,
		"-v, --version",
		"see the current version of canyon-uploader",
	)
	.usage("[options or commands] arguments")
	.addHelpText("beforeAll", CLI_BEFORE_ALL_TXT)
	.addHelpText("after", CLI_AFTER_ALL_TXT)
	.configureHelp({
		optionTerm: (option) => accent(option.flags),
		subcommandTerm: (cmd) => accent(cmd.name(), cmd.usage()),
		argumentTerm: (arg) => accent(arg.name()),
	})
	.addHelpCommand(false)
	.showHelpAfterError(true);

/**
 * * CLI Commands with hit
 */

program
	.command("hit")
	.option("--dsn <dsn>", "dsn of the canyon server")
	.option("--project_id <project_id>", "id of the project")
	.option("--commit_sha <commit_sha>", "commit sha of the project")
	.allowExcessArguments(false)
	.allowUnknownOption(false)
	.description("modify react native project code to adapt to canyon")
	.addHelpText(
		"after",
		`\nFor help, head on to ${accent(
			"https://github.com/canyon-project/canyon",
		)}`,
	)
	.action(async (params, options) => await hitCommand(params, options));

/**
 * * CLI Commands with map
 */
program
	.command("map")
	.option("--dsn <dsn>", "dsn of the canyon server")
	.option("--project_id <project_id>", "id of the project")
	.option("--sha <commit_sha>", "commit sha of the project")
	.option("--instrument_cwd <coverage>", "instrument_cwd")
  .option("--branch <branch>", "branch of the project")
  .option("--provider <provider>", "provider")
	  .option("--workspace <workspace>", "workspace")
	.allowExcessArguments(false)
	.allowUnknownOption(false)
	.description("modify react native project code to adapt to canyon")
	.addHelpText(
		"after",
		`\nFor help, head on to ${accent(
			"https://github.com/canyon-project/canyon",
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
