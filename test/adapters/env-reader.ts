import t from "tap";
import EnvReader from "../../lib/adapters/env-reader";
import { EnvReaderError } from "../../lib/adapters/env-reader/errors";
import SourceFileMaker from "../test-fixtures/source-file-maker";

t.test("return list of env variables used in file", async (t) => {

	t.test("assigned as process.env.<variableName>", async (t) => {
		const envReader = new EnvReader();
		const envVariableNames = ["SENTRY_API_KEY", "PORT", "ENABLE_DEBUG_MODE"];
		const dirPath = t.testdir({
			"constants.js": SourceFileMaker.create(envVariableNames),
		});

		const returnedVariables = await envReader.getVariables(
			`${dirPath}/constants.js`,
		);

		t.same(returnedVariables, envVariableNames);
	});

	t.test("when stream reads less than a line at a time", async (t) => {
		const approximatelyTenCharsPerRead = 2 * 10;
		const envReader = new EnvReader({
			highWaterMark: approximatelyTenCharsPerRead,
		});
		const envVariableNames = ["GOOGLE_API_KEY", "NODE_ENV", "FEATURE_TOGGLE_A"];
		const dirPath = t.testdir({
			"constants.js": SourceFileMaker.create(envVariableNames),
		});

		const returnedVariables = await envReader.getVariables(
			`${dirPath}/constants.js`,
		);

		t.same(returnedVariables, envVariableNames);
	});

	t.test("when source file has one line of code without newline at end of file", async (t) => {
		const envReader = new EnvReader();
		const dirPath = t.testdir({
			"constants.js": "export const nodePort = process.env.NODE_PORT;"
		});

		const returnedVariables = await envReader.getVariables(
			`${dirPath}/constants.js`,
		);

		t.same(returnedVariables, ['NODE_PORT']);
	});

	t.test("returns an empty array when the file doesn't has env variables defined", async(t) => {
		const envReader = new EnvReader();
		const dirPath = t.testdir({
			"constants.js": "console.log('hello world');"
		});

		const returnedVariables = await envReader.getVariables(
			`${dirPath}/constants.js`,
		);

		t.type(returnedVariables, Array);
		t.equal(returnedVariables.length, 0);
	});

	t.test("returns an empty array when the file is empty", async(t) => {
		const envReader = new EnvReader();
		const dirPath = t.testdir({
			"constants.js": ""
		});

		const returnedVariables = await envReader.getVariables(
			`${dirPath}/constants.js`,
		);

		t.type(returnedVariables, Array);
		t.equal(returnedVariables.length, 0);
	});

	t.end();
});

t.test('throw an error when it fails opening the file', async(t) => {
	const EnvReaderMock = t.mock('../../lib/adapters/env-reader', {
		'node:fs/promises': {
		  open: () =>Promise.reject(new Error('cannot open file'))
		},
	  }).default;

	const envReader = new EnvReaderMock();
	const expectedError = new EnvReaderError('cannot open file', 'reading ./env.js file');
	
	t.rejects(envReader.getVariables('./env.js'), expectedError);
});
