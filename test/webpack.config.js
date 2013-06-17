var RewirePlugin = require("rewire-webpack"),
    AlamidWebpackPlugin = require("../lib/core/bundle/AlamidWebpackPlugin.class.js");

module.exports = {
    entry: "mocha!./main.client.js",
    output: {
        filename: "tests.js"
    },
    devTool: "inline-source-map",
    plugins: [
        new AlamidWebpackPlugin(),
        new RewirePlugin()
    ],
    module: {
        loaders: [
            { test: /\.html$/i, loader: "raw-loader" }
        ]
    }
};