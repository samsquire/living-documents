var webpack = require('webpack');
module.exports = {
    entry: "./entry.js",
    output: {
        path: __dirname + "/build",
        filename: "bundle.js"
    },
    module: {
        loaders: [
      { test: /\.css$/, loader: "style!css" },
      { test: /\.png$/, loader: "url-loader?limit=100000" },
      { test: /\.jpg$/, loader: "file-loader" },
      { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' },
    { test: require.resolve("jquery"), loader: "expose?$!expose?jQuery" }
        ]

    
  },
    plugins:[new webpack.ProvidePlugin({                
                jQuery: "jquery",
                $: "jquery"
            })]

};
