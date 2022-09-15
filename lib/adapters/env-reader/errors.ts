export class EnvReaderError extends Error {
    readonly intent: string;

    constructor(message: string, intent: string) {
        super(message);
        this.intent = intent;

        Object.setPrototypeOf(this, EnvReaderError.prototype);
    }

    toString(): string {
        return `error: ${this.intent}\n${this.message}`
    }
}