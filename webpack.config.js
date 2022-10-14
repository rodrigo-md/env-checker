const path = require("path");
const fs = require("fs");
const ShebangPlugin = require("webpack-shebang-plugin");
const StringReplacePlugin = require("string-replace-webpack-plugin");

module.exports = (async () => {
  // https://github.com/swc-project/swc-loader/issues/56
  const swcrc = await fs.readFileSync(
    path.resolve(__dirname, ".swcrc"),
    "utf8"
  );

  return {
    entry: {
      main: {
        import: "./lib/index.ts",
        filename: "index.js",
      },
    },
    target: "node",
    mode: "none",
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: "swc-loader",
            options: {
              ...JSON.parse(swcrc),
            },
          },
        },
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: StringReplacePlugin.replace({
              replacements: [
                {
                  pattern: /import {(?<promisesMethods>.+)} from (?<quotes>"|')node:fs\/promises\2(?<eol>;?\n)?/g,
                  replacement: function(match, p1,p2,p3, offset, string, groups) {
                    const { promisesMethods, quotes, eol } = groups;
                      return `import { promises as fspromises } from ${quotes}node:fs${quotes}${eol}const {${promisesMethods}} = fspromises;\n`;
                  }
                }
              ]
            }),
          },
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".js"],
    },
    externals: [
      // rename node:<module> => module for backward compatibility with versions < node18
      function ({ request }, callback) {
        if (/^node:/.test(request)) {
          return callback(null, `commonjs ${request.replace(/node:/, "")}`);
        }
        callback();
      },
    ],
    plugins: [new ShebangPlugin()],
    output: {
      filename: "index.js",
      path: path.resolve(__dirname, "bin"),
    },
  };
})();
