export default abstract class SourceFileMaker {
	static create(variableNames: string[]): string {
		let fileContent = "";
		for (let variableName of variableNames) {
			fileContent += `const ${camelCase(
				variableName,
			)} = process.env.${variableName};\n`;
		}

		return fileContent;
	}
}

function camelCase(variableName: string): string {
    return variableName.toLowerCase().replace(/_(\w)/g, (_: string, ...args: string[]) => {
        return args[0].toUpperCase();
    });
}
    