const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: {
    index: [
      path.join(__dirname, './index.js'),
      path.join(__dirname, './index.html'),
    ],
  },

  output: {
    path: path.join(__dirname, './dist'),
    filename: '[name].js',
    publicPath: '/',
  },

  resolve: {
    alias: {
      tape: 'browser-tap',
    },
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: [],
      },

      {
        test: [/\.html$/],
        use: [
          {
            loader: 'file-loader',
            options: { name: '[name].[ext]' },
          },
        ],
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.GEODB_USER_TOKEN': `"${process.env.GEODB_USER_TOKEN}"`,
      'process.env.GEODB_API_KEY': `"${process.env.GEODB_API_KEY}"`,
    }),
  ],

  devtool: false,
}
