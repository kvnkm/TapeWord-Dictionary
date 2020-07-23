const path = require("path");

module.exports = {
  mode: "production",
  devtool: "source-map",
  entry: {
    background: "./src/background/index.ts",
    contentScript: "./src/view/index.ts",
  },
  module: {
    rules: [
      {
        test: /\.ts/,
        use: "ts-loader",
        include: [path.resolve(__dirname, "src")],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
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
