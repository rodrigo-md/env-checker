import t from "tap";
import EnvCheckCmd from "../../lib/handlers/env-check-cmd";
import { createTestStream } from "../test-utils/stream";
import TestReporter from "../test-utils/test-reporter";

t.test("print the comand's description when succeed", async (t) => {
	const { stream, streamCollector } = createTestStream();
    const dir = t.testdir({
        ".env": "NODE_ENV=development",
		src: {
            "environment.js": "export const NODE_ENV = process.env.NODE_ENV;",
		},
	});
	const args = {
		src: `${dir}/src/environment.js`,
		checkEnv: `${dir}/.env`
	};
	const reporter = new TestReporter(stream);
	const cmd = new EnvCheckCmd(reporter);

	await cmd.execute(args);

	t.equal(
		await streamCollector.flush(),
		"\u2713 Environment variables documented\n",
	);
});

t.test("print the command's description when fails", async (t) => {
	const { stream, streamCollector } = createTestStream();
    const dir = t.testdir({
        ".env": "",
		src: {
            "environment.js": "export const NODE_ENV = process.env.NODE_ENV;",
		},
	});
	const args = {
		src: `${dir}/src/environment.js`,
		checkEnv: `${dir}/.env`
	};
	const reporter = new TestReporter(stream);
	const cmd = new EnvCheckCmd(reporter);

	await cmd.execute(args);

    const output = await streamCollector.flush();

	t.equal(
		/✗ Environment variables documented/.test(output),
		true,
        output
	);
});

t.test('return its result', async(t) => {
	t.test('when is false', async (t) => {
        const { stream } = createTestStream();
        const dir = t.testdir({
            ".env": "",
            src: {
                "environment.js": "export const NODE_ENV = process.env.NODE_ENV;",
            },
        });

        const args = {
            src: `${dir}/src/environment.js`,
            checkEnv: `${dir}/.env`
        };

        const reporter = new TestReporter(stream);
        const envCheckCmd = new EnvCheckCmd(reporter);

        const result = await envCheckCmd.execute(args);

        t.equal(result, false);
    });

    t.test('when is true', async (t) => {
        const { stream } = createTestStream();
        const dir = t.testdir({
            ".env": "NODE_ENV=development",
            src: {
                "environment.js": "export const NODE_ENV = process.env.NODE_ENV;",
            },
        });

        const args = {
            src: `${dir}/src/environment.js`,
            checkEnv: `${dir}/.env`,
        };

        const reporter = new TestReporter(stream);
        const envCheckCmd = new EnvCheckCmd(reporter);

        const result = await envCheckCmd.execute(args);

        t.equal(result, true);
    });

    t.end();
});
