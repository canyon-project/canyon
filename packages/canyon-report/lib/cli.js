#!/usr/bin/env node

const path = require('path');

const { program } = require('commander');

const CCR = require('./index.js');

const version = require('../package.json').version;


const executeCommand = async (command, cliOptions) => {
  console.log(command,cliOptions)
  const ccr = CCR({
    name: 'My Coverage Report - 2024-02-28',
    outputDir: './coverage-reports',
    reports: ["v8", "console-details"],
    cleanCache: true
  });
  await ccr.add({});
  await ccr.generate();
}

process.on('uncaughtException', function(err) {
    console.log(err.stack);
});

// the -- separator
const argv = [];
const subArgv = [];
let separator = false;
process.argv.forEach((it) => {
    if (!separator && it === '--') {
        separator = true;
    }
    if (separator) {
        subArgv.push(it);
    } else {
        argv.push(it);
    }
});

program
    .name('ccr')
    .description('CLI to generate coverage reports')
    .version(version, '-v, --version', 'output the current version')
    .argument('[command]', 'command to execute')
    .allowUnknownOption()
    .option('-c, --config <path>', 'custom config file path')
    .option('-l, --logging <logging>', 'off, error, info, debug')

    .option('-n, --name <name>', 'report name for title')
    .option('-r, --reports <name[,name]>', 'coverage reports to use')

    .option('-o, --outputDir <dir>', 'output dir for reports')
    .option('-i, --inputDir <dir>', 'input dir for merging raw files')
    .option('-b, --baseDir <dir>', 'base dir for normalizing path')

    .option('-a, --all <dir>', 'include all files from dir')

    .option('--entryFilter <pattern>', 'entry url filter')
    .option('--sourceFilter <pattern>', 'source path filter')
    .option('--filter <pattern>', 'the combined filter')

    .option('--outputFile <path>', 'output file for v8 report')
    .option('--inline', 'inline html for v8 report')
    .option('--assetsPath <path>', 'assets path if not inline')

    .option('--lcov', 'generate lcov.info file')

    .option('--import <module>', 'preload module at startup')
    .option('--require <module>', 'preload module at startup')

    .option('--env [path]', 'env file (default: ".env")')

    .action((_command, cliOptions) => {
        const args = [].concat(program.args).concat(subArgv);
        if (args[0] === '--') {
            args.shift();
        }
        const command = args.join(' ').trim();
        if (!command) {
            program.outputHelp();
            return;
        }

        executeCommand(command, cliOptions);
    });

program.parse(argv);
