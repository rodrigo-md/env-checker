import { PassThrough } from "node:stream";
import StreamCollector from "./stream-collector";

export function createTestStream() {
	const stream = new PassThrough();
	const streamCollector = new StreamCollector(stream);
	return {
		stream,
		streamCollector,
	};
}
