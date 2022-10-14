export interface EnvReader {
    getVariables(filePath: string): Promise<string[]>;
}