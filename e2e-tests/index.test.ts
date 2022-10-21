import t from "tap";
import { execCmd } from "./test-utils/exec-cmd";

t.test(
	"published version in the distribution channel match the current branch",
	async (t) => {
		const expectedVersion = process.env.VERSION;
		const { stdout, stderr } = await execCmd("envchecker --version");

		t.ok(stderr.length === 0, `stderr: ${stderr}`);
		t.match(stdout, new RegExp(`${expectedVersion}`, "gi"));
	},
);

t.test(
	"envchecker display a list with missing variables when aren't found",
	async (t) => {
		const { stdout, stderr } = await execCmd(
			"envchecker --src=./test-cases/single-plain-file/constants.js --check-env=./test-cases/single-plain-file/.env.failure",
			{
				cwd: __dirname
			}
		);

		t.ok(stderr.length === 0, `stderr: ${stderr}`);
		t.match(stdout, /missing variables:\n\s-\sBASE_URL\n/g);
	},
);

t.test(
	"envchecker display green check when all variables are documented",
	async (t) => {
		const { stdout, stderr } = await execCmd(
			"envchecker --src=./test-cases/single-plain-file/constants.js --check-env=./test-cases/single-plain-file/.env.success",
			{
				cwd: __dirname
			}
		);

		t.ok(stderr.length === 0, `stderr: ${stderr}`);
		t.match(stdout, /\u2713 Environment variables documented\n/gu);
	},
);
