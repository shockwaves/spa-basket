'use strict';

var webpack = require("webpack");

module.exports = {
    entry: "./src/js/app.js",
    output: {
        path: __dirname + "/assets/js",
        filename: "app.js"
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        })
    ],
    watch: true
};