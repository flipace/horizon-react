var webpack = require('webpack');

const config = {
  module: {
    loaders: [
      {
        test: /\.js?$/,
        loader: 'babel',
        include: /src/,
        exclude: /node_modules/
      }
    ]
  },
  plugins: []
};

if (process.env.NODE_ENV !== 'development') {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = config;
