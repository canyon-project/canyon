import chalk from "chalk";
// import { program } from "commander";
// import { version } from "../package.json";
//
//
// const accent = chalk.greenBright;
//
// async function crnAction(params: any, options: any): Promise<any>{
//   console.log('????')
// }
//
// /**
//  * * Program Default Configuration
//  */
// const CLI_BEFORE_ALL_TXT = `canyon: The ${accent(
//   "Canyon"
// )} CLI - Version ${version} (${accent(
//   "https://github.com/canyon-project/canyon"
// )}) ${chalk.black.bold.bgYellowBright(" ALPHA ")} \n`;
//
// const CLI_AFTER_ALL_TXT = `\nFor more help, head on to ${accent(
//   "https://github.com/canyon-project/canyon"
// )}`;
//
// program
//   .name("canyon")
//   .version(version, "-v, --version", "see the current version of canyon-cli")
//   .usage("[options or commands] arguments")
//   .addHelpText("beforeAll", CLI_BEFORE_ALL_TXT)
//   .addHelpText("after", CLI_AFTER_ALL_TXT)
//   .configureHelp({
//     optionTerm: (option) => accent(option.flags),
//     subcommandTerm: (cmd) => accent(cmd.name(), cmd.usage()),
//     argumentTerm: (arg) => accent(arg.name()),
//   })
//   .addHelpCommand(false)
//   .showHelpAfterError(true);
//
//
// /**
//  * * CLI Commands
//  */
//
// program
//   .command("crn")
//   .option(
//     "--dsn <dsn>",
//     "dsn of the canyon server"
//   )
//   .option(
//     "--reporter <reporter>",
//     "reporter auth token"
//   )
//   .option(
//     "--project_id <project_id>",
//     "id of the project"
//   )
//   .option("--commit_sha <commit_sha>", "commit sha of the project")
//   .option("--branch <branch>", "branch of the project")
//   .option("--buildId <buildId>", "buildId of the project")
//   .option("--report_id <report_id>", "report id of the case")
//   .option("--gitlab_url <gitlab_url>", "gitlab url of the project")
//   .option("--payload_path <payload_path>", "payload_path")
//   .option("--appid <appid>", "appid")
//   .option("--module <module>", "module")
//   .allowExcessArguments(false)
//   .allowUnknownOption(false)
//   .description("modify react native project code to adapt to canyon")
//   .addHelpText(
//     "after",
//     `\nFor help, head on to ${accent(
//       "https://github.com/canyon-project/canyon"
//     )}`
//   )
//   .action(async (params, options) => await crnAction(params, options));
//
export const cli = async (args: string[]) => {
	try {
		console.log("???", chalk.greenBright("canyon-cli"));
		// await program.parseAsync(args);
	} catch (e) {}
};

// console.log('canyon: xtaro config/index.js updated successfully.');
