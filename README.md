# Envchecker  
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)
[![circleci](https://circleci.com/gh/rodrigo-md/envchecker-cli/tree/main.svg?style=shield)](<LINK>)


A command-line tool to verify that the environment variables used in your code through files like `constants.js` or `config.ts` are being documented in other files like:
- [✓] .env.example
- [✓] README.md
- [ ] Dockerfile (not yet)
- [ ] docker-compose.yml (not yet)
- [ ] helm values.yml (not yet)

## Installation

`npm install -g envchecker-cli@latest`

or

`yarn global add envchecker-cli@latest`

## Usage

The tool receives the path to a source file where the environment variables are being used.

```javascript
// file: src/constants.js
const baseUrl = process.env.API_BASE_URL;
const prefix = process.env.API_PREFIX;
const dbUser = process.env.DB_USER;
const dbName = process.env.DB_NAME;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;

export default {
    baseUrl,
    prefix,
    db: {
        user: dbUser,
        password: dbPassword,
        host: dbHost,
        name: dbName
    }
};
```

It also receives the path to the file we want to check whether documents those variables or not.

```bash
# file: .env.example
DB_NAME=postgres
DB_HOST=localhost
DB_PASSWORD=
```

On the terminal type:

`> envchecker --src=./src/constants.js --check-env=.env.example`

and for this case, the output is:

![envchecker output](https://user-images.githubusercontent.com/5626113/195949439-725a17ff-0734-45ca-9164-b8f1d6ffc8b6.png)

## How does it work

Envchecker scans your source file and seeks `process.env` declarations. Then it keeps a list of the declarations found and searches for them in the target file, scanning the file line by line.

If you use a third-party package to read environment variables and export them automatically as configuration objects to your code as the package [nconf](https://github.com/indexzero/nconf) does. **Then, in that case, this package won't work**.

## Command options

* **--version**
    * Display the package version
* **--source, --src**
    * The path to the source code file where the environment variables are being read
* **--check-env, --ce**
    * The path to the target file to check that the environment variables used are documented
* **--help**
    * The command's help


## Author

* Rodrigo Martinez Diaz ([@_rodrigomd](https://twitter.com/_rodrigomd))


