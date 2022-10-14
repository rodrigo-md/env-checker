import type { Reporter } from "./interfaces/reporter";
import type { EnvReader } from "./interfaces/env-reader";
import type { EnvChecker } from "./interfaces/env-checker";

interface CmdArgs {
	// Path to the source of true file were we're going to get the list of variables declared
	src: string;
	// Path to the file that's going to be scan to see if it has the variables defined
	checkEnv: string;

	// operation name
	operation: string;
}

const OPERATION_STATUS = {
	SUCCEED: true,
	FAILED: false,
};

export default class CheckPlainFile {
	private envReader: EnvReader;
	private reporter: Reporter;
	private envChecker: EnvChecker;

	constructor(
		reporter: Reporter,
		envReader: EnvReader,
		envChecker: EnvChecker,
	) {
		this.reporter = reporter;
		this.envReader = envReader;
		this.envChecker = envChecker;
	}

	async execute({ src, checkEnv, operation }: CmdArgs): Promise<boolean> {
		try {
			const envVariables = await this.envReader.getVariables(src);
			await this.envChecker.validateVariablesPresence(checkEnv, envVariables);
			this.reporter.operationSucceded(operation);
			return OPERATION_STATUS.SUCCEED;
		} catch (error) {
			this.reporter.operationFailed(operation);
			this.reporter.reportError(error);
			return OPERATION_STATUS.FAILED;
		}
	}
}
