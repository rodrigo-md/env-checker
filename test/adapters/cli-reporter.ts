import t from "tap";
import CLIReporter from "../../lib/adapters/cli-reporter";
import { createTestStream } from "../test-utils/stream";

t.test("render operation succeded", async (t) => {
	const { stream, streamCollector } = createTestStream();
	const reporter = new CLIReporter(stream);

	reporter.operationSucceded("Search environment variables");

	t.equal(
		await streamCollector.flush(),
		"  \x1b[32m\u2713\x1b[39m Search environment variables\n",
	);
});

t.test('render operation failed', async (t) => {
	const { stream, streamCollector } = createTestStream();
	const reporter = new CLIReporter(stream);

	reporter.operationFailed("Search environment variables");

	t.equal(
		await streamCollector.flush(),
		"  \x1b[91m\u2717\x1b[39m Search environment variables\n",
	);
})

t.test("render error", async (t) => {
	const { stream, streamCollector } = createTestStream();
	const reporter = new CLIReporter(stream);

	class CustomError extends Error {
		readonly intent: string;
		constructor(message: string, intent: string) {
			super(message);
			this.intent = intent;

			Object.setPrototypeOf(this, CustomError.prototype);
		}

		toString(): string {
			return `error: ${this.intent}\n${this.message}`;
		}
	}

	reporter.reportError(
		new CustomError("cannot open file", "reading file .env"),
	);

	t.equal(
		await streamCollector.flush(),
		"\n\x1b[91merror: reading file .env\x1b[39m\n\x1b[91mcannot open file\x1b[39m",
	);
});

t.test("don't render error when receives a non error object", async (t) => {
	const { stream, streamCollector } = createTestStream();
	const reporter = new CLIReporter(stream);

	reporter.reportError({ message: "this isn't an error" });

	t.equal(await streamCollector.flush(), "");
});

t.test('render a new line', async () => {
	const { stream, streamCollector } = createTestStream();
	const reporter =  new CLIReporter(stream);

	reporter.renderEmptyLine();

	t.equal(await streamCollector.flush(), "\n");
})
