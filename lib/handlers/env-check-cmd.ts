import EnvReader from "../adapters/env-reader";
import EnvChecker from "../adapters/env-checker";
import CheckPlainFile from "../use-cases/check-plain-file";
import { Reporter } from "../use-cases/interfaces/reporter";

export interface CheckCmdArgs {
	src: string;
	checkEnv: string;
}

export default class EnvCheckCmd {
	private reporter: Reporter;
	private useCase: CheckPlainFile;
	readonly description = "Environment variables documented";

	constructor(reporter: Reporter) {
		this.reporter = reporter;

		const envReader = new EnvReader();
		const envChecker = new EnvChecker();
		this.useCase = new CheckPlainFile(this.reporter, envReader, envChecker);
	}

	async execute(args: CheckCmdArgs): Promise<boolean> {
		const result = await this.useCase.execute({
			...args,
			operation: this.description,
		});
		return result;
	}
}
