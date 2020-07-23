const path = require("path");
const ExtensionReloader = require("webpack-extension-reloader");

module.exports = {
  mode: "development",
  watch: true,
  devtool: "inline-source-map",
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
        use: [
          {
            loader: "style-loader",
            options: {
              esModule: true,
            },
          },
          "css-modules-typescript-loader",
          {
            loader: "css-loader",
            options: {
              modules: true,
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ["url-loader"],
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
  plugins: [
    new ExtensionReloader({
      reloadPage: false,
      entries: {
        background: "background",
        contentScript: "contentScript",
      },
    }),
  ],
};
