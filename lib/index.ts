#!/usr/bin/env node
import { stdout } from "node:process";
import yargs from "yargs";
import EnvCheckCmd from "./handlers/env-check-cmd";
import CLIReporter from "./adapters/cli-reporter";
import pkg from '../package.json'
import { CheckCmdArgs } from './handlers/env-check-cmd';

const args = yargs
	.scriptName("envchecker")
	.usage("$0 [args]")
	.options({
		source: {
			alias: "src",
			describe: "path to source file using the environment variables",
			demandOption: true,
		},
		"check-env": {
			alias: "ce",
			describe: "path to .env file used as example (.env.example)",
		},
	})
	.implies("source", "check-env")
	.example([["$0 --source=src/constants/index.js --check-env=.env.example"]])
	.version(pkg.version)
	.help().argv;

const reporter = new CLIReporter(stdout);
const cmd = new EnvCheckCmd(reporter);

(async() => {
	reporter.renderEmptyLine();
	await cmd.execute(args as unknown as CheckCmdArgs);
})();
