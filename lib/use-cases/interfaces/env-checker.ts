export interface EnvChecker {
    validateVariablesPresence(path: string, envVariables: string[]): Promise<void>;
}