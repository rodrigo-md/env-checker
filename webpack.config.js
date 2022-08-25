const path = require("path");
const fs = require("fs");
const webpack = require("webpack");

module.exports = (async () => {
    // https://github.com/swc-project/swc-loader/issues/56
    const swcrc = await fs.readFileSync(path.resolve(__dirname, ".swcrc"), "utf8");

    return {
    entry: path.resolve(__dirname, "lib"),
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
                ...JSON.parse(swcrc)
            },    
          },
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".js"],
    },
    externals: [
      // rename node:<module> => module for backward compatibility with versions < node16
      function({request}, callback) {
        if(/^node:/.test(request)) {
          return callback(null, `commonjs ${request.replace(/node:/, '')}`);
        }
        callback();
      }
    ],
    output: {
      filename: "index.js",
      path: path.resolve(__dirname, "bin"),
    },
  };
})();
