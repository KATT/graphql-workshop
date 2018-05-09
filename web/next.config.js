const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

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
    return config;
  },
};
