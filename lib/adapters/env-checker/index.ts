import { open } from "node:fs/promises";
import type {
	EnvChecker as Checker,
} from "../../use-cases/interfaces/env-checker";
import { EnvCheckerError, MissingVariablesError } from "../env-checker/errors";

const APPROXIMATELY_120_CHARS_PER_LINE = 120 * 2;
export default class EnvChecker implements Checker {
	private highWaterMark = APPROXIMATELY_120_CHARS_PER_LINE;

	constructor(config?: { highWaterMark?: number }) {
		if (config && config.highWaterMark) {
			this.highWaterMark = config.highWaterMark;
		}
	}

	async validateVariablesPresence(
		path: string,
		envVariables: string[],
	): Promise<void> {
		try {
			let buffer = "";
			let variablesFound: string[] = [];

			const fd = await open(path);
			const stream = fd.createReadStream({
				encoding: "utf8",
				highWaterMark: this.highWaterMark,
			});

			for await (let data of stream) {
				const { envVariables, rest } = this.extractEnvVariablesFromStream(
					data,
					buffer,
				);
				buffer = rest;
				variablesFound = [...variablesFound, ...envVariables];
			}

			if (buffer.length > 0) {
				variablesFound = [
					...variablesFound,
					...this.extractEnvVariables(buffer),
				];
			}

			const missingVariables = this.getDiff(envVariables, variablesFound);

			if (missingVariables.length > 0) {
				throw new MissingVariablesError(path, missingVariables);
			}
		} catch (e) {
			if (e instanceof EnvCheckerError) {
				throw e;
			} else {
				throw new EnvCheckerError((e as Error).message, `reading file ${path}`);
			}
		}
	}

	private extractEnvVariablesFromStream(
		data: string,
		previousDataRest: string,
	) {
		const content = previousDataRest + data;
		const lastIndexNextLineChar = content.lastIndexOf("\n");

		const code = content.substring(0, lastIndexNextLineChar);

		// * safe operation: in case LastIndexNextLineChar + 1 > content.length, substring replace it for content.length
		// * substring(content.length, content.length) always returns an empty string
		const rest = content.substring(lastIndexNextLineChar + 1, content.length);

		const envVariables = this.extractEnvVariables(code);

		return {
			rest,
			envVariables,
		};
	}

	private extractEnvVariables(code: string) {
		return code.match(/[a-zA-Z0-9_]+(?==.*(;|$|\n))/gi) || [];
	}

	private getDiff(a: string[], b: string[]): string[] {
		return a.filter((item) => {
			return !b.some((bitem) => bitem === item);
		});
	}
}
