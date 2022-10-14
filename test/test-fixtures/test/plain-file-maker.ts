import t from "tap";
import PlainFileMaker from "../plain-file-maker";

t.test(
	"returns a single string whith each line containing a variable passed in",
	async (t) => {
		const envVariables = [
			["NODE_ENV", "local"],
			["FUNC_URL", "localhost:3000"],
			["APIGEE_CLIENT_ID", "1289asd812e1w2e97eqd"],
			["APIGEE_CLIENT_SECRET", "89AaD8ad9821nf8Ffga"],
			["BASE_PREFIX", "/product/v1"],
			["DATABASE_PORT", 5432],
			["DATABASE_NAME", "postgres"],
		];
		const output =
			"NODE_ENV=local\n" +
			"FUNC_URL=localhost:3000\n" +
			"APIGEE_CLIENT_ID=1289asd812e1w2e97eqd\n" +
			"APIGEE_CLIENT_SECRET=89AaD8ad9821nf8Ffga\n" +
			"BASE_PREFIX=/product/v1\n" +
			"DATABASE_PORT=5432\n" +
			"DATABASE_NAME=postgres\n";

		const fileContent = PlainFileMaker.create(envVariables);

		t.equal(fileContent, output);
	},
);
