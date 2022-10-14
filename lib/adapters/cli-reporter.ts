import { Writable } from "node:stream";
import chalk from "chalk";
import { Reporter } from '../use-cases/interfaces/reporter';

const errorColor = chalk.redBright;
const successColor = chalk.green;

export default class CLIReporter implements Reporter {
	private stream: Writable;
	constructor(stream: Writable) {
		this.stream = stream;
	}

	renderEmptyLine(): void {
		this.stream.write('\n');
	}

	operationSucceded(operation: string): void {
		this.stream.write(`  ${successColor('\u2713')} ${operation}\n`);
	}

	operationFailed(operation: string): void {
		this.stream.write(`  ${errorColor('\u2717')} ${operation}\n`);
	}

	reportError(err: unknown): void {
		if (err instanceof Error) {
			this.stream.write(`\n${errorColor(err.toString())}`);
		}
	}
}
