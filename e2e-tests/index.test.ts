import t from "tap";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { execCmd } from './test-utils/exec-cmd';

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
