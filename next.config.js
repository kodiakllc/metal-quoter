const { i18n } = require('./next-i18next.config');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  reactStrictMode: true,

  webpack(config, { isServer, dev }) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
      topLevelAwait: true,
    };

    config.resolve.fallback = {
      ...config.resolve.fallback,
    };

    config.plugins.push(
      new LodashModuleReplacementPlugin({
        modularize: true,
        isEqual: 'isEqual',
      }),
    );

    return config;
  },
};

module.exports = nextConfig;
