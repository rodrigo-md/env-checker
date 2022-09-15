import t from "tap";
import CheckPlainFile from "../../lib/use-cases/check-plain-file";
import TestReporter from "../test-utils/test-reporter";
import { EnvReaderError } from "../../lib/adapters/env-reader/errors";
import EnvReader from "../../lib/adapters/env-reader";
import EnvChecker from "../../lib/adapters/env-checker";
import { EnvCheckerError } from "../../lib/adapters/env-checker/errors";
import { createTestStream } from "../test-utils/stream";
import SourceFileMaker from "../test-fixtures/source-file-maker";
import PlainFileMaker from "../test-fixtures/plain-file-maker";

t.test("print error when cannot open source file", async (t) => {
	const args = {
		src: "./src",
		checkEnv: ".env.example",
		operation: "Environment variables documented",
	};
	const { stream, streamCollector } = createTestStream();
	const reporter = new TestReporter(stream);
	const envReader = {
		getVariables(path: string) {
			return Promise.reject(
				new EnvReaderError(
					"cannot open file",
					`reading variables from ${path}`,
				),
			);
		},
	};
	const envChecker = {
		validateVariablesPresence() {
			return Promise.resolve();
		},
	};
	const sut = new CheckPlainFile(reporter, envReader, envChecker);
	const output = `\u2717 Environment variables documented\nerror: reading variables from ${args.src}\ncannot open file`;

	await sut.execute(args);

	t.equal(await streamCollector.flush(), output);
});

t.test("print error when cannot open env file", async (t) => {
	const args = {
		src: "./src",
		checkEnv: ".env.example",
		operation: "Environment variables documented",
	};
	const { stream, streamCollector } = createTestStream();
	const reporter = new TestReporter(stream);
	const envReader = {
		getVariables() {
			return Promise.resolve(["DB_PASSWORD", "DB_HOST"]);
		},
	};
	const envChecker = {
		validateVariablesPresence() {
			return Promise.reject(
				new EnvCheckerError(
					"cannot open file",
					`validating variables in ${args.checkEnv}`,
				),
			);
		},
	};
	const sut = new CheckPlainFile(reporter, envReader, envChecker);
	const output = `\u2717 Environment variables documented\n\nerror: validating variables in ${args.checkEnv}\ncannot open file\n`;

	await sut.execute(args);

	t.equal(await streamCollector.flush(), output);
});

t.test("interact with files and directories", async (t) => {
	t.test("print error with missing variables in .env file", async (t) => {
		const { stream, streamCollector } = createTestStream();
		const sourceEnvVariables = [
			"DB_USER",
			"DB_PASSWORD",
			"DB_HOST",
			"SENTRY_API_KEY",
			"AWS_SECRET",
		];

		const envFileVariables = [
			["DB_HOST", "127.0.0.0"],
			["API_SECRET", "a78sdg98q1723ER8F7HG"],
			["DB_USER", "postgres"],
		];
		const dir = t.testdir({
			".env.example": PlainFileMaker.create(envFileVariables),
			src: {
				"constants.js": SourceFileMaker.create(sourceEnvVariables),
			},
		});
		const args = {
			src: `${dir}/src/constants.js`,
			checkEnv: `${dir}/.env.example`,
			operation: "Environment variables documented",
		};

		const reporter = new TestReporter(stream);
		const envReader = new EnvReader();
		const envChecker = new EnvChecker();
		const checkPlainFile = new CheckPlainFile(reporter, envReader, envChecker);
		const output =
			"\u2717 Environment variables documented\n" +
			"\nerror: reading file " +
			dir +
			"/.env.example\n" +
			"missing variables:\n" +
			" - DB_PASSWORD\n" +
			" - SENTRY_API_KEY\n" +
			" - AWS_SECRET\n\n";

		await checkPlainFile.execute(args);

		t.equal(await streamCollector.flush(), output);
	});

	t.test("returns false when are missing variables", async (t) => {
		const { stream } = createTestStream();
		const dir = t.testdir({
			".env.example": "",
			src: {
				"constants.js": SourceFileMaker.create(["SECRET_KEY"]),
			},
		});
		const args = {
			src: `${dir}/src/constants.js`,
			checkEnv: `${dir}/.env.example`,
			operation: "Environment variables documented",
		};

		const reporter = new TestReporter(stream);
		const envReader = new EnvReader();
		const envChecker = new EnvChecker();
		const checkPlainFile = new CheckPlainFile(reporter, envReader, envChecker);

		const result = await checkPlainFile.execute(args);

		t.equal(result, false);
	});

	t.test("print operation successfull when variables where found", async (
		t,
	) => {
		const { stream, streamCollector } = createTestStream();
		const envVariables = ["LOG_LEVEL", "NODE_ENV"];
		const definedVariables = [
			["NODE_ENV", "development"],
			["LOG_LEVEL", "info"],
		];
		const dir = t.testdir({
			".env.example": PlainFileMaker.create(definedVariables),
			src: {
				"constants.js": SourceFileMaker.create(envVariables),
			},
		});
		const args = {
			src: `${dir}/src/constants.js`,
			checkEnv: `${dir}/.env.example`,
			operation: "Environment variables documented",
		};

		const reporter = new TestReporter(stream);
		const envReader = new EnvReader();
		const envChecker = new EnvChecker();
		const checkPlainFile = new CheckPlainFile(reporter, envReader, envChecker);

		await checkPlainFile.execute(args);

		t.equal(
			await streamCollector.flush(),
			"\u2713 Environment variables documented\n",
		);
	});

	t.test("returns true when all variables were found", async (t) => {
		const { stream } = createTestStream();
		const dir = t.testdir({
			".env.example": "LOG_LEVEL=debug",
			src: {
				"constants.js": SourceFileMaker.create(["LOG_LEVEL"]),
			},
		});
		const args = {
			src: `${dir}/src/constants.js`,
			checkEnv: `${dir}/.env.example`,
			operation: "Environment variables documented",
		};

		const reporter = new TestReporter(stream);
		const envReader = new EnvReader();
		const envChecker = new EnvChecker();
		const checkPlainFile = new CheckPlainFile(reporter, envReader, envChecker);

		const result = await checkPlainFile.execute(args);

		t.equal(result, true);
	});

	t.end();
});
