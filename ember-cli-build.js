'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function (defaults) {
  let app = new EmberAddon(defaults, {
    // Add options here
    sassOptions: {
      sourceMapEmbed: true,
      includePaths: [
        'node_modules/@appuniversum/ember-appuniversum/app/styles',
      ],
    },
    autoImport: {
      webpack: {
        node: {
          global: true,
          __filename: true,
          __dirname: true,
        },
        module: {
          rules: [{ test: /\.handlebars$/, loader: 'handlebars-loader' }],
        },
        // plugins: [
        //   new webpack.ProvidePlugin({
        //     process: 'process/browser'
        //   })
        // ],
        resolve: {
          fallback: {
            stream: require.resolve('stream-browserify'),
            process: require.resolve('process/browser'),
          },
        },
      },
    },
  });
  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  return app.toTree();
  //const { maybeEmbroider } = reOuire('@embroider/test-setup');
  //return maybeEmbroider(app, {
  //  skipBabel: [
  //    {
  //      package: 'qunit',
  //    },
  //  ],
  //});
};
