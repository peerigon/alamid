"use strict";

var Class = require("alamid-class"),
    webpackMiddleware = require("webpack-dev-middleware"),
    webpack = require("webpack"),
    AlamidWebpackPlugin = require("./AlamidWebpackPlugin.class.js"),
    alamidConfig = require("../config.server.js"),
    env = require("../../shared/env.js"),
    path = require("path");

var isDev = env.isDevelopment() || env.isTesting();

var Bundler = new Class("Bundler", {
    config: null,
    constructor: function (config) {
        this.config = config || Bundler.defaultConfig;
    },
    createBundle: function (callback) {
        webpack(this.config, callback);
    },
    getDevMiddleware: function () {
        var config = Object.create(this.config);

        config.output = Object.create(this.config.output);
        config.output.path = "/";

        return webpackMiddleware(webpack(config), {
            noInfo: false,
            quiet: false,
            stats: { colors: true },
            publicPath: config.output.publicPath
        });
    }
});

Bundler.defaultConfig = {
    alamidConfig: alamidConfig,
    context: alamidConfig.paths.root,
    entry: "./app/init.client.js",
    output: {
        path: path.join(alamidConfig.paths.bundle, "/statics"),
        publicPath: "/statics/",
        filename: "app.js"
    },
    cache: true,
    amd: { jQuery: true },
    optimize: {
        minChunkSize: 10000,
        maxChunks: 20
    },
    debug: isDev,
    devtool: isDev ? "eval" : null,
    minimize : !isDev,
    module: {
        loaders: [
            { test: /\.html$/i, loader: "raw-loader" }
        ]
    },
    resolve: {
        root: process.env.NODE_PATH
    },
    plugins: [
        new AlamidWebpackPlugin()
    ]
};

module.exports = Bundler;