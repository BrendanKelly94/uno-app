const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry:'./src/frontend/Index.js',
  output: {
   filename: 'bundle.js',
   path: path.resolve(__dirname , './public')
 },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: "babel-loader",
          options: {
            presets: ['@babel/react',
              [ "@babel/env", {
                "targets": {
                  "browsers": [ "last 2 versions" ]
                },
                //exclude: [ 'transform-regenerator' ],
                "modules": false
              }]
            ],
            "plugins": [
                ["@babel/plugin-transform-runtime",
                {
                    "regenerator": true
                }]
            ]
          }
        }]
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader"
          }
        ]
      }
    ]

  }

};
