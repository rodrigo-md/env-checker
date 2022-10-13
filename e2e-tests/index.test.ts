import t from 'tap';
import path from 'node:path';
import  { exec } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';


const execCmd = promisify(exec);

t.test('published version in the distribution channel match the current branch', async(t) => {
    const pkg = JSON.parse(await readFile(path.resolve(__dirname,'../package.json'), {encoding: 'utf8'}));

    const { stdout } = await execCmd(`$HOME/.nvm/versions/node/v${process.env.TARGET_NODE}/bin/node /usr/local/bin/envchecker --version`);

    t.match(stdout, new RegExp(`${pkg.version}`, 'gi'));
}); 