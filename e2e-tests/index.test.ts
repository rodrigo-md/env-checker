import t from "tap";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { execCmd } from "./test-utils/exec-cmd";

t.test(
	"published version in the distribution channel match the current branch",
	async (t) => {
		const pkg = JSON.parse(
			await readFile(path.resolve(__dirname, "../package.json"), {
				encoding: "utf8",
			}),
		);

		const { stdout, stderr } = await execCmd("envchecker --version");

		t.ok(stderr.length === 0, `stderr: ${stderr}`);
		t.match(stdout, new RegExp(`${pkg.version}`, "gi"));
	},
);

t.test(
	"enchecker display a list with missing variables when aren't found",
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
	"enchecker display green check when all variables are documented",
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
