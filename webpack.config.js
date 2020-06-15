const path = require("path");

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: {
    background: "./src/background/index.ts",
    contentScript: "./src/view/display.ts",
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
