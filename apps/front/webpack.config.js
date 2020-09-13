const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const createStyledComponentsTransformer = require('typescript-plugin-styled-components')
  .default;

const __DEV__ = process.env.NODE_ENV === 'development';

const title = 'Poker Room';

const styledComponentsTransformer = createStyledComponentsTransformer({
  getDisplayName: (filename, bindingName) => {
    const name = path.basename(filename).split('.')[0];
    return `${name}_${bindingName || ''}`;
  },
});

function getSetting(name) {
  if (!process.env[name]) {
    throw new Error(`${name} is not set`);
  }
  return process.env[name];
}

module.exports = {
  name: 'client',
  target: 'web',
  mode: __DEV__ ? 'development' : 'production',
  devtool: __DEV__ ? 'cheap-module-source-map' : false,
  entry: {
    app: './src/main.tsx',
  },
  stats: 'errors-only',
  devServer: {
    compress: true,
    port: 9000,
    hot: true,
    stats: 'errors-only',
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: process.env.API_URL || 'http://localhost:3000',
      },
    },
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json', 'json5'],
    alias: {
      src: path.join(__dirname, './src'),
    },
  },
  optimization: __DEV__
    ? {
        splitChunks: {
          cacheGroups: {
            commons: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      }
    : undefined,
  output: {
    filename: '[name].[hash].js',
    chunkFilename: '[name].[hash].js',
    path: path.join(__dirname, './build'),
    publicPath: '/',
  },
  plugins: [
    new CleanWebpackPlugin(),
    // new CopyWebpackPlugin([{ from: path.join(__dirname, 'static') }]),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, './index.ejs'),
      hash: false,
      filename: 'index.html',
      inject: false,
      minify: {
        collapseWhitespace: false,
      },
      title,
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(getSetting('NODE_ENV')),
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              getCustomTransformers: () => ({
                before: [styledComponentsTransformer],
              }),
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          },
        ],
      },
    ],
  },
};
