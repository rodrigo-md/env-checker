import { open } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { EnvReaderError } from "./errors";
import type {
	EnvReader as Reader,
} from "../../use-cases/interfaces/env-reader";

const APPROXIMATELY_120_CHARS_PER_LINE = 2 * 120;

interface EnvReaderConfig {
	highWaterMark: number;
}

export default class EnvReader implements Reader {
	private highWaterMark: number = APPROXIMATELY_120_CHARS_PER_LINE;

	constructor(config?: EnvReaderConfig) {
		if (config?.highWaterMark) {
			this.highWaterMark = config.highWaterMark;
		}
	}

	async getVariables(filePath: string): Promise<string[]> {
		try {
			let buffer = "";
			let variablesFound: string[] = [];
			let stream;

			const fileHandler = await open(filePath);
			// @ts-ignore
			if (fileHandler.createReadStream) {
				stream = fileHandler.createReadStream({
					encoding: "utf8",
					highWaterMark: this.highWaterMark,
				});
			} else {
				stream = createReadStream('', { fd: fileHandler.fd, emitClose: true });
			}

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

			return variablesFound;
		} catch (error) {
			throw new EnvReaderError(
				(error as Error).message,
				`reading ${filePath} file`,
			);
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
		return code.match(/(?<=process\.env\.)\w+(?=(;|$|\n))/gi) || [];
	}
}
