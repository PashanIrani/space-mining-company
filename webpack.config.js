const HookShellScriptPlugin = require("hook-shell-script-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.ts",
  output: {
    filename: "index.js",
    path: __dirname + "/public/scripts",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [{ test: /\.ts$/, loader: "ts-loader" }],
  },
  plugins: [
    new HookShellScriptPlugin({
      afterEmit: ["npm run clean"],
    }),
  ],
};
