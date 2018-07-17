const path = require('path')

const production = process.env.NODE_ENV === 'production'

module.exports = {
  entry: {
    index: [
      path.join(__dirname, './index.js'),
      path.join(__dirname, './index.html'),
    ],
  },

  output: {
    path: path.join(__dirname, './dist'),
    filename: production ? '[name]-[hash:8].js' : '[name].js',
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
            options: {name: '[name].[ext]'},
          },
        ],
      },
    ],
  },

  devtool: production ? 'source-map' : false,
}
