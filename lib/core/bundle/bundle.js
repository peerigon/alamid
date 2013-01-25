"use strict"; // run code in ES5 strict mode

var fs = require("fs"),
    path = require("path"),
    EventEmitter = require("events").EventEmitter,
    webpack = require("webpack"),
    formatOutput = require("webpack/lib/formatOutput"),
    webpackMiddleware = require("webpack-dev-middleware"),
    fshelpers = require("fshelpers"),
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
        output: paths.bundle + "/app.js",
        publicPrefix: "/",
        context: paths.root,
        includeFilenames: isDev,
        debug: isDev,
        minimize : !isDev,
        extensions: ["", ".client.js", ".js"],
        profile: true,
        resolve: {
            loaders: [
                { test: /\.html$/i, loader: "raw" }
            ],
            postprocess: {
                normal: [resolveFilename]
            }
        },
        alamidConfig: config
    };
}

/**
 * Create a bundle containing the client
 * pass config (paths.root, paths.bundle, isDev have to be defined)
 * @param {!Object} config
 */
function createBundle(config, callback) {

    var paths = config.paths,
        bundleFolder = paths.bundle,
        bootstrapPath = path.join(__dirname, "bootstrap.client.loader.js") + "!" + bundleFolder + "/index.html";

    var webpackEvents = new EventEmitter();

    var webpackOptions = getWebpackOptions(config);

    //additional settings
    webpackOptions.events = webpackEvents;

    webpack(bootstrapPath, webpackOptions, function onWebpackFinished(err, stats) {

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

    var middlewareEvents = new EventEmitter(),
        webpackOptions = getWebpackOptions(config),
        paths = config.paths,
        bundleFolder = paths.bundle,
        bootstrapPath = path.join(__dirname, "bootstrap.client.loader.js") + "!" + bundleFolder + "/index.html";

    middlewareEvents.on("bundle-invalid", function() {
        logger.debug("App change detected. Updating bundle.");
    });

    middlewareEvents.on("bundle",function onBundleReady(stats) {

        logger.debug("Bundle ready." + "\n" +
            formatOutput(stats, {
                    colors: true,
                    context: webpackOptions.context
                }
            ));
    });

    webpackOptions.events = middlewareEvents;
    //we enable watch mode for the dev server
    //per request re-bundling can be enabled by setting "watch : false"
    webpackOptions.watch = true;

    return webpackMiddleware(__dirname, bootstrapPath, {
        quiet: true,
        context: webpackOptions.context,
        webpack: webpackOptions
    });
}

exports.getWebpackOptions = getWebpackOptions;
exports.createBundle = createBundle;
exports.initServeBundleMiddleware = initServeBundleMiddleware;

