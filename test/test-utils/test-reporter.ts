import { Writable } from "node:stream";
import type { Reporter } from "../../lib/use-cases/interfaces/reporter";

export default class TestReporter implements Reporter {
	private stream: Writable;

	constructor(stream: Writable) {
		this.stream = stream;
	}
	operationSucceded(operation: string): void {
		this.stream.write(`\u2713 ${operation}\n`);
	}
	operationFailed(operation: string): void {
		this.stream.write(`\u2717 ${operation}\n`);
	}

	reportError(error: unknown) {
		if (error instanceof Error) {
			this.stream.write(error.toString());
		}
	}
}
