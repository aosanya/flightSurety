const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");


module.exports = {
  entry: './src/dapp/index.js',
  output: {
    path: path.join(__dirname, "prod/dapp"),
    filename: "bundle.js",
    chunkFilename: '[name].js',
    publicPath: "/"
  },
  module: {
    rules: [
      {
          test: /\.jsx?$/,         // Match both .js and .jsx files
          exclude: /node_modules/,
          loader: "babel-loader",
          query:
            {
              presets:['react']
            }
      },
      {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src/dapp/index.html")
    })
  ],
  resolve: {
    extensions: [".js"]
  },
  devServer: {
    contentBase: path.join(__dirname, "dapp"),
    port: 8000,
    stats: "minimal",
    // must be `true` for SPAs
    historyApiFallback: true,
  }
};
