"use strict";

var Base = require("../../shared/Base.class.js"),
    webpackMiddleware = require("webpack-dev-middleware"),
    webpack = require("webpack"),
    AlamidWebpackPlugin = require("./AlamidWebpackPlugin.class.js"),
    alamidConfig = require("../config.server.js"),
    env = require("../../shared/env.js"),
    path = require("path");

var isDev = env.isDevelopment() || env.isTesting(),
    instance;

var Bundler = Base.extend("Bundler", {
    config: null,
    stats: null,
    constructor: function (config) {
        this.config = config || Bundler.defaultConfig;
    },
    createBundle: function (callback) {
        var self = this;

        webpack(this.config, function onBundleCreated(err, stats) {
            if (!err) {
                self.stats = stats;
            }

            callback(err, stats);
        });
    },
    getDevMiddleware: function () {
        var config = Object.create(this.config);

        config.output = Object.create(this.config.output);
        config.output.path = "/";

        return webpackMiddleware(webpack(config), {
            noInfo: !config.debug,
            watchDelay: config.watchDelay,
            quiet: false,
            stats: { colors: true },
            publicPath: config.output.publicPath
        });
    }
});

Bundler.getInstance = function () {
    return instance || (instance = new Bundler());
};

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
    devtool: "eval",
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