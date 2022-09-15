export interface Reporter {
	operationSucceded(operation: string): void;
	reportError(err: unknown): void;
	operationFailed(operation: string): void;
}
