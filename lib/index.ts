import yargs from "yargs";

const args  = yargs
	.scriptName("env-checker")
	.usage("$0 [args]")
	.options({
		source: {
			alias: "src",
			describe:
				"path to source file using the environment variables",
            demandOption: true
		},
	})
	.help().argv;

console.log(args);