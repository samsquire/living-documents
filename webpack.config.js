var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var loaders = [
      /*{ test: /\electron.js$/, loader: 'ignore-loader'}, */
      { test: /\.css$/, loader: "style!css" },
      { test: /\.png$/, loader: "url-loader?limit=100000" },
      { test: /\.jpg$/, loader: "file-loader" },
      { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' },
    { test: require.resolve("jquery"), loader: "expose?$!expose?jQuery" }
        ];
module.exports = [
{
    entry: "./web.entry.js",
    output: {
        path: __dirname + "/build",
        filename: "web.bundle.js"
    },
    resolve: {
      extensions: ['', '.js', '.web.js' ]
    },
    module: { loaders: loaders},
    plugins: [new webpack.ProvidePlugin({                
                jQuery: "jquery",
                $: "jquery"
            }),
    new HtmlWebpackPlugin({
      entry: 'web.entry.js',
      filename: 'index.html',
      template: 'app/index.html'
    }),
  new webpack.IgnorePlugin(/.*\.electron\.js/)
  ]
},
{
    entry: "./electron.entry.js",
    output: {
        path: __dirname + "/build",
        filename: "electron.bundle.js"
    },
    resolve: {
      extensions: ['', '.js', '.electron.js' ]
    },
    module: { loaders: loaders},
    plugins: [
      new webpack.ProvidePlugin({                
                jQuery: "jquery",
                $: "jquery"
            }),
    new HtmlWebpackPlugin({
      filename: 'electron.html',
      template: 'app/index.html'
    }),
  new webpack.IgnorePlugin(/.*\.electron\.js/)
  ]
}


];
