import t from "tap";
import { PassThrough } from "node:stream";
import StreamCollector from "../stream-collector";

t.test(
	"receives a readable stream and returns a single string with all the reads",
	async (t) => {
		const stream = new PassThrough();
		const streamCollector = new StreamCollector(stream);
		const output = "hola\n" + "como estas?\n" + "yo, bien y tu?";

		stream.write("hola\n");
		stream.write("como estas?\n");
		stream.write("yo, bien y tu?");
		stream.end();

		const streamOutput = await streamCollector.flush();

		t.equal(streamOutput, output);
	},
);

t.test("close the stream when flush is called", async (t) => {
	const stream = new PassThrough();
	const streamCollector = new StreamCollector(stream);

	stream.write("closing...");

	await streamCollector.flush();

	t.ok(stream.closed);
	t.end();
});
