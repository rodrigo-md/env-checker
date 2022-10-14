import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { ExecOptions } from "node:child_process";

const execPromisified = promisify(exec);

/**
 *  Runs the command in a child process using an specific node version that must be installed
 *  using nvm package before using this utility
 *
 * @param command envchecker followed by config options (e.g envchecker --version)
 * @param options By default it overrides $PATH to search in the .nvm folder
 *                the specific node version defined in $TARGET_NODE to run the command
 * @returns A promise resolved to an object containing `stdout` and `stderr` strings
 */
export const execCmd = (
	command: string,
	options: ExecOptions = {},
): Promise<{ stdout: string; stderr: string }> => {
	return execPromisified(command, {
		...options,
		env: {
			PATH: `${process.env.HOME}/.nvm/versions/node/v${process.env.TARGET_NODE}/bin:${process.env.PATH}`,
		},
	});
};
