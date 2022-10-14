import t from "tap";
import { PassThrough } from "node:stream";
import { createTestStream } from "../stream";
import StreamCollector from "../stream-collector";

t.test(
	"createTestStream function returns a PassThrough stream and a streamCollector instance",
	async (t) => {
		const { stream, streamCollector } = createTestStream();

		t.type(stream, PassThrough);
		t.type(streamCollector, StreamCollector);
	},
);
