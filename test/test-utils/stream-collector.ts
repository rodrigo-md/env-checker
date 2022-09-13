import { Readable } from 'node:stream';

export default class {
    #promise: Promise<string>;

    constructor(stream: Readable) {
        this.#promise = new Promise(resolve => {
            const chunks: string[] = [];
            stream.on('data', (chunk: string) => {
                chunks.push(chunk);
            });

            stream.on('end', () => resolve(chunks.join('')));
        })
    }

    flush(): Promise<string> {
        return this.#promise;
    }
}