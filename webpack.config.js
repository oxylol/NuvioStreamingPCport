const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

const appDirectory = path.resolve(__dirname);

// React Native Web babel loader
const babelLoaderConfiguration = {
  test: /\.(js|jsx|ts|tsx)$/,
  include: [
    path.resolve(appDirectory, 'index.web.tsx'),
    path.resolve(appDirectory, 'App.tsx'),
    path.resolve(appDirectory, 'src'),
    // Include react-native and related packages
    path.resolve(appDirectory, 'node_modules/react-native-web'),
    path.resolve(appDirectory, 'node_modules/react-native-reanimated'),
    path.resolve(appDirectory, 'node_modules/react-native-gesture-handler'),
    path.resolve(appDirectory, 'node_modules/@react-navigation'),
    path.resolve(appDirectory, 'node_modules/react-native-screens'),
    path.resolve(appDirectory, 'node_modules/react-native-safe-area-context'),
    path.resolve(appDirectory, 'node_modules/react-native-paper'),
    path.resolve(appDirectory, 'node_modules/@gorhom/bottom-sheet'),
    path.resolve(appDirectory, 'node_modules/@shopify/flash-list'),
    path.resolve(appDirectory, 'node_modules/react-native-vector-icons'),
    path.resolve(appDirectory, 'node_modules/@expo/vector-icons'),
    path.resolve(appDirectory, 'node_modules/react-native-svg'),
  ],
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      presets: [
        ['@babel/preset-env', { targets: { electron: '28' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript',
      ],
      plugins: [
        ['@babel/plugin-transform-runtime', { regenerator: true }],
      ],
    },
  },
};

// SVG loader
const svgLoaderConfiguration = {
  test: /\.svg$/,
  use: [
    {
      loader: '@svgr/webpack',
      options: {
        native: false,
        svgoConfig: {
          plugins: [{ removeViewBox: false }],
        },
      },
    },
  ],
};

// Image loader
const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png|webp)$/,
  type: 'asset/resource',
  generator: {
    filename: 'images/[hash][ext][query]',
  },
};

// Font loader
const fontLoaderConfiguration = {
  test: /\.(woff|woff2|eot|ttf|otf)$/,
  type: 'asset/resource',
  generator: {
    filename: 'fonts/[hash][ext][query]',
  },
};

// Lottie JSON loader
const lottieLoaderConfiguration = {
  test: /\.lottie$/,
  type: 'asset/resource',
};

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';

  return {
    entry: path.resolve(appDirectory, 'index.web.tsx'),
    output: {
      path: path.resolve(appDirectory, 'dist'),
      filename: isDev ? '[name].bundle.js' : '[name].[contenthash].js',
      chunkFilename: isDev ? '[name].chunk.js' : '[name].[contenthash].chunk.js',
      publicPath: '/',
      clean: true,
    },
    target: 'electron-renderer',
    resolve: {
      alias: {
        'react-native$': 'react-native-web',
        'react-native-linear-gradient': 'react-native-web-linear-gradient',
        '@react-native-community/blur': path.resolve(__dirname, 'src/web/mocks/blur.ts'),
        'react-native-mmkv': path.resolve(__dirname, 'src/web/mocks/mmkv.ts'),
        'expo-haptics': path.resolve(__dirname, 'src/web/mocks/haptics.ts'),
        'expo-brightness': path.resolve(__dirname, 'src/web/mocks/brightness.ts'),
        'expo-navigation-bar': path.resolve(__dirname, 'src/web/mocks/navigationBar.ts'),
        'expo-file-system': path.resolve(__dirname, 'src/web/mocks/fileSystem.ts'),
        'expo-screen-orientation': path.resolve(__dirname, 'src/web/mocks/screenOrientation.ts'),
        'expo-keep-awake': path.resolve(__dirname, 'src/web/mocks/keepAwake.ts'),
        'expo-status-bar': path.resolve(__dirname, 'src/web/mocks/statusBar.ts'),
        'react-native-immersive-mode': path.resolve(__dirname, 'src/web/mocks/immersiveMode.ts'),
        '@kesha-antonov/react-native-background-downloader': path.resolve(__dirname, 'src/web/mocks/backgroundDownloader.ts'),
        'react-native-google-cast': path.resolve(__dirname, 'src/web/mocks/googleCast.ts'),
        '@sentry/react-native': path.resolve(__dirname, 'src/web/mocks/sentry.ts'),
        'posthog-react-native': path.resolve(__dirname, 'src/web/mocks/posthog.ts'),
        'expo-live-activity': path.resolve(__dirname, 'src/web/mocks/liveActivity.ts'),
        'lottie-react-native': path.resolve(__dirname, 'src/web/mocks/lottie.ts'),
        '@adrianso/react-native-device-brightness': path.resolve(__dirname, 'src/web/mocks/deviceBrightness.ts'),
        'react-native-video': path.resolve(__dirname, 'src/web/components/WebVideoPlayer.tsx'),
        '@shopify/react-native-skia': path.resolve(__dirname, 'src/web/mocks/skia.ts'),
      },
      extensions: [
        '.web.tsx',
        '.web.ts',
        '.web.jsx',
        '.web.js',
        '.tsx',
        '.ts',
        '.jsx',
        '.js',
        '.json',
      ],
      fallback: {
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/'),
        process: require.resolve('process/browser'),
      },
    },
    module: {
      rules: [
        babelLoaderConfiguration,
        svgLoaderConfiguration,
        imageLoaderConfiguration,
        fontLoaderConfiguration,
        lottieLoaderConfiguration,
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(appDirectory, 'web/index.html'),
        filename: 'index.html',
      }),
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(isDev),
        'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'src/assets', to: 'assets', noErrorOnMissing: true },
          { from: 'assets', to: 'assets', noErrorOnMissing: true },
        ],
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      compress: true,
      port: 8080,
      hot: true,
      historyApiFallback: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    devtool: isDev ? 'eval-source-map' : 'source-map',
    optimization: {
      minimize: !isDev,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },
  };
};
