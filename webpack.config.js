const path = require("path");

module.exports = {
  mode: "development",
  devtool: "eval-source-map",
  entry: {
    background: "./src/background.ts",
    contentScript: "./src/display.ts",
  },
  module: {
    rules: [
      {
        test: /\.ts/,
        use: "ts-loader",
        include: [path.resolve(__dirname, "src")],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    publicPath: "dist",
    path: path.resolve(__dirname, "dist"),
    filename: "[name]/index.js",
  },
};
