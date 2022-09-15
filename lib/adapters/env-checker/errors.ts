export class EnvCheckerError extends Error {
	readonly intent: string;

	constructor(message: string, intent: string) {
		super(message);
		Object.setPrototypeOf(this, EnvCheckerError.prototype);
		this.intent = intent;
	}

	toString(): string {
		return `\nerror: ${this.intent}\n${this.message}\n`;
	}
}

export class MissingVariablesError extends EnvCheckerError {
	constructor(filepath: string, variables: string[]) {
		super("", `reading file ${filepath}`);
		Object.setPrototypeOf(this, MissingVariablesError.prototype);
		this.message = this.generateMessage(variables);
	}

	private generateMessage(variables: string[]): string {
		let message = "missing variables:\n";
		for (let variable of variables) {
			message += ` - ${variable}\n`;
		}

		return message;
	}
}
