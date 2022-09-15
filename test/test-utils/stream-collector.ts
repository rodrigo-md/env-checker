import { Duplex } from "node:stream";
import { promisify } from "node:util";

export default class {
	private chunks: string[] = [];
	private stream: Duplex;

	constructor(stream: Duplex) {
		this.stream = stream;

		this.stream.on("data", (chunk: string) => {
			this.chunks.push(chunk);
		});
	}

	async flush(): Promise<string> {
		await promisify(this.stream.end.bind(this.stream))();

		return this.chunks.join("");
	}
}
