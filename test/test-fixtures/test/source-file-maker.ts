import t from 'tap';
import SourceFileMaker from '../source-file-maker';

t.test("returns a single string whith each line containing a variable passed in", async (t) => {
    const envVariables = [
        'DB_PASSWORD',
        'DB_HOST',
        'DB_USER',
        'GOOGLE_API_KEY',
    ];
    const output = 
    'const dbPassword = process.env.DB_PASSWORD;\n' +
    'const dbHost = process.env.DB_HOST;\n' +
    'const dbUser = process.env.DB_USER;\n' +
    'const googleApiKey = process.env.GOOGLE_API_KEY;\n';

    const sourceFileContent = SourceFileMaker.create(envVariables);

    t.equal(sourceFileContent, output);
});