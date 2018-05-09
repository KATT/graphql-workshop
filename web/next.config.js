const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  webpack(config, { isServer, dev }) {
    if (dev && !isServer) {
      // skip clear console
      config.plugins = config.plugins.filter(
        plugin => plugin.constructor.name !== 'FriendlyErrorsWebpackPlugin',
      );
      config.plugins.push(
        new FriendlyErrorsWebpackPlugin({ clearConsole: false }),
      );
    }

    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.GRAPHQL_URL': JSON.stringify(process.env.GRAPHQL_URL),
      }),
    );

    return config;
  },
};
