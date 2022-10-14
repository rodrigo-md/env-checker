import t from "tap";
import EnvChecker from "../../lib/adapters/env-checker";
import PlainFileMaker from "../test-fixtures/plain-file-maker";

t.test("throws an error when open the file", async (t) => {
	const EnvCheckerMock = t.mock("../../lib/adapters/env-checker", {
		"node:fs/promises": {
			open: () => Promise.reject(new Error("cannot open file")),
		},
	}).default;

	const envChecker = new EnvCheckerMock();

	try {
		await envChecker.validateVariablesPresence(".env.example", [
			"NODE_ENV",
			"DB_HOST",
		]);
		t.fail("envchecker must fail when cannot open the target file");
	} catch (e) {
		t.type(e, Error);
		t.equal(e.toString(), "\nerror: reading file .env.example\ncannot open file\n");
	}
});

t.test(
	"The error thrown must include the intent indicating the filepath",
	async (t) => {
		const EnvCheckerMock = t.mock("../../lib/adapters/env-checker", {
			"node:fs/promises": {
				open: () => Promise.reject(new Error("cannot open file")),
			},
		}).default;

		const envChecker = new EnvCheckerMock();

		try {
			await envChecker.validateVariablesPresence(".env", [
				"NODE_ENV",
				"DB_HOST",
			]);
			t.fail("envchecker must fail when cannot open the target file");
		} catch (e) {
			t.type(e, Error);
			t.equal(e.toString(), "\nerror: reading file .env\ncannot open file\n");
		}
	},
);

t.test("throw an error with the list of variables missing: ", async (t) => {
	t.test("list all variables when the file is empty", async (t) => {
		const envVariables = ["DB_HOST", "DB_USER", "DB_PASSWORD"];
		const dir = t.testdir({
			".env.example": PlainFileMaker.create([]),
		});

		const filePath = `${dir}/.env.example`;
		const envChecker = new EnvChecker();

		try {
			await envChecker.validateVariablesPresence(filePath, envVariables);
			t.fail("envChecker must fail when doesn't find all env variables");
		} catch (e) {
			t.type(e, Error);
			t.equal(
				e.toString(),
				`\nerror: reading file ${filePath}\nmissing variables:\n - DB_HOST\n - DB_USER\n - DB_PASSWORD\n\n`,
			);
		}
	});

	t.test(
		"list all variables when the file has content but not variables in it",
		async (t) => {
			const envVariables = ["DB_HOST", "DB_USER", "DB_PASSWORD"];
			const dir = t.testdir({
				".env.example":
					"# Do not delete this file\n#This works as a template for local .env files",
			});

			const filePath = `${dir}/.env.example`;
			const envChecker = new EnvChecker();

			try {
				await envChecker.validateVariablesPresence(filePath, envVariables);
				t.fail("envChecker must fail when doesn't find all env variables");
			} catch (e) {
				t.type(e, Error);
				t.equal(
					e.toString(),
					`\nerror: reading file ${filePath}\nmissing variables:\n - DB_HOST\n - DB_USER\n - DB_PASSWORD\n\n`,
				);
			}
		},
	);

	t.test("list only the missing variables", async (t) => {
		const envVariables = ["DB_HOST", "DB_USER", "DB_PASSWORD"];
		const variablesPresent = [
			["DB_HOST", "localhost"],
			["DB_PASSWORD", "a1289as98d12ed"],
		];
		const dir = t.testdir({
			".env.example": PlainFileMaker.create(variablesPresent),
		});

		const filePath = `${dir}/.env.example`;
		const envChecker = new EnvChecker();

		try {
			await envChecker.validateVariablesPresence(filePath, envVariables);
			t.fail("envChecker must fail when doesn't find all env variables");
		} catch (e) {
			t.type(e, Error);
			t.equal(
				e.toString(),
				`\nerror: reading file ${filePath}\nmissing variables:\n - DB_USER\n\n`,
			);
		}
	});

	t.end();
});

t.test("ends successfully when all variables are present", async (t) => {
	t.test("in a file with a single variable", async (t) => {
		const dir = t.testdir({
			".env.example": "API_KEY=asid2e787ased8",
		});
		const filepath = `${dir}/.env.example`;
		const envChecker = new EnvChecker();

		t.doesNotThrow(
			() => envChecker.validateVariablesPresence(filepath, ["API_KEY"]),
		);
	});

	t.test("in a file with many variables", async (t) => {
		const envVariables = [
			"SENTRY_API_KEY",
			"GOOGLE_MAPS_API_KEY",
			"AWS_ACCESS_KEY_ID",
			"AWS_REGION",
			"S3_TARGET_BUCKET",
			"APIGEE_GATEWAY_SECRET",
			"NEW_RELIC_LICENSE_KEY",
			"LOG_LEVEL",
			"BASE_PATH",
		];
		const definedVariables = [
			["GOOGLE_MAPS_API_KEY", "1928e9a8d9812hedads"],
			["AWS_ACCESS_KEY_ID", "AS8D99FGHQSA8e9a8d98ASDAS12hedads"],
			["AWS_REGION", "us-east-1"],
			["LOG_LEVEL", "info"],
			["SENTRY_API_KEY", "78923fba87s23rbgqawe908fh923ruwhf8978127wrg"],
			["S3_TARGET_BUCKET", "attachments"],
			["APIGEE_GATEWAY_SECRET", "hasdf7G1278ASA8998sdasd"],
			["NEW_RELIC_LICENSE_KEY", "JKASDJ12as8912e98hadbvcvnxas"],
			["BASE_PATH", "https://api.example.com/v1/service-x"],
		];
		const dir = t.testdir({
			".env.example": PlainFileMaker.create(definedVariables),
		});

		const filepath = `${dir}/.env.example`;
		// Simulate reading less than a line at a time
		const envChecker = new EnvChecker({ highWaterMark: 20 * 2 });

		t.doesNotThrow(
			() => envChecker.validateVariablesPresence(filepath, envVariables),
		);
	});

	t.test("in a file with comments and not assigned variables", async (t) => {
		const dir = t.testdir({
			".env.example":
				"# Do not delete this file\nDB_HOST=localhost\n# here db creds\nDB_USER=postgres\nDB_PASSWORD=1289E98ASD",
		});

		const filepath = `${dir}/.env.example`;
		// Simulate reading less than a line at a time
		const envChecker = new EnvChecker();

		t.doesNotThrow(
			() =>
				envChecker.validateVariablesPresence(filepath, [
					"DB_USER",
					"DB_PASSWORD",
					"DB_PASSWORD",
				]),
		);
	});

	t.end();
});
