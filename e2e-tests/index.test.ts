import t from "tap";
import path from "node:path";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
// import { promisify } from "node:util";

// const execCmd = promisify(spawn);

t.test(
	"published version in the distribution channel match the current branch",
	(t) => {
		t.plan(1);

		(async () => {
			const pkg = JSON.parse(
				await readFile(path.resolve(__dirname, "../package.json"), {
					encoding: "utf8",
				}),
			);

			const envchecker = spawn('envchecker', ["--src", "constants.js", "--check-env", ".env"], {
				argv0: `$HOME/.nvm/versions/node/v${process.env.TARGET_NODE}/bin/node`,
				shell: true
			});

			let stdout = "";

			envchecker.stdout.on("data", (data) => {
				stdout += data;
			});

			envchecker.stderr.on("data", (data) => {
				t.fail(data);
			});

			envchecker.on("close", (code) => {
				if (code === 0) {
					t.match(stdout, new RegExp(`${pkg.version}`, "gi"));
					t.end();
				}
			});
		})();
	},
);
