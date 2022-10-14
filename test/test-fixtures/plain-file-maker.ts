export default abstract class PlainFileMaker {
	static create(variablesDefinitions: (string|number)[][]): string {
		let content = "";

		for (let [variableName, value] of variablesDefinitions) {
			content += `${variableName}=${value}\n`;
		}

		return content;
	}
}
