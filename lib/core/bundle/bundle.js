"use strict"; // run code in ES5 strict mode

var fs = require("fs"),
    path = require("path"),
    EventEmitter = require("events").EventEmitter,
    webpack = require("webpack"),
    webpackMiddleware = require("webpack-dev-middleware"),
    resolveFilename = require("./resolveFilename.js"),
    renderBootstrapClient = require("./renderer/renderBootstrapClient.js"),
    logger = require("../../shared/logger.js").get("core"),
    env = require("../../shared/env.js");

/**
 * get the Webpack Options to work with alamid
 * pass config (paths.root, paths.bundle, isDev have to be defined)
 *
 * @param {!Object} config
 * @return {Object}
 */
function getWebpackOptions(config) {

    var paths = config.paths,
        isDev = env.isDevelopment() || env.isTesting();

    return {
        alamidConfig: config,
        entry: path.join(__dirname, "bootstrap.client.loader.js") + "!" + paths.bundle + "/index.html",
        output: {
            path: path.join(paths.bundle, "assets", "javascript"),
            publicPath: "/assets/",
            filename: "app.[hash].js"
        },
        cache: true,
        amd: { jQuery: true },
        context: paths.root,
        optimize: {
            minChunkSize: 10000,
            maxChunks: 20
        },
        debug: isDev,
        devtool: "eval",
        minimize : !isDev,
        resolve: {
            root: process.env.NODE_PATH,
            loaders: [
                { test: /\.html$/i, loader: "raw" }
            ]
        },
        resolveLoader: resolveFilename
    };
}

/**
 * Create a bundle containing the client
 * pass config (paths.root, paths.bundle, isDev have to be defined)
 * @param {!Object} config
 */
function createBundle(config, callback) {

    var paths = config.paths,
        webpackEvents = new EventEmitter(),
        webpackOptions = exports.getWebpackOptions(config);

    //additional settings
    webpackOptions.events = webpackEvents;

    webpack(webpackOptions, function onWebpackFinished(err, stats) {

        if (err) {
            callback(err);
            return;
        }

        logger.debug("\n" +
            formatOutput(stats, {
                    colors: true,
                    context: webpackOptions.context
                }
            ));
        if (stats.errors.length === 0) {
            logger.info("Bundle created in " + stats.time/1000 + "s");
            callback(null, stats);
        } else {
            logger.error("Bundle creation failed ...");
            callback(stats.errors[0]);
        }
    });
}

/**
 * get the serveBundleMiddleware to be used with the router
 * this function initializes the bundler and returns the actual middleware-function
 *
 * @param {!options} config
 * @return {Function} webpackMiddleware
 */
function initServeBundleMiddleware(config) {

    var webpackOptions = exports.getWebpackOptions(config);

    return webpackMiddleware(webpack(webpackOptions), {
        quiet: false
    });
}

exports.getWebpackOptions = getWebpackOptions;
exports.createBundle = createBundle;
exports.initServeBundleMiddleware = initServeBundleMiddleware;

