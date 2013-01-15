"use strict"; // run code in ES5 strict mode

var fs = require("fs"),
    EventEmitter = require("events").EventEmitter,
    webpack = require("webpack"),
    formatOutput = require("webpack/lib/formatOutput"),
    webpackMiddleware = require("webpack-dev-middleware"),
    fshelpers = require("fshelpers"),
    resolveFilename = require("./resolveFilename.js"),
    renderBootstrapClient = require("./renderer/renderBootstrapClient.js"),
    logger = require("../../shared/logger.js").get("bundle");

/**
 * get the Webpack Options to work with alamid
 * pass config (paths.root, paths.bundle, isDev have to be defined)
 *
 * @param {!Object} config
 * @return {Object}
 */
function getWebpackOptions(config) {

    var paths = config.paths,
        isDev = config.isDev;

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
        }
    };
}

/**
 * Removes the tmpFolder
 *
 * @param {String} bootstrapPath
 */
function removeTmpBootstrap(bootstrapPath) {
    fs.unlinkSync(bootstrapPath);
}

/**
 * Generates temporary modules like the bootstrap.client.js
 * needed as entry point for the bundling process
 *
 * @param {Object} config
 * @param {String} bootstrapPath
 */
function generateTmpBootstrap(config, bootstrapPath) {
    fs.writeFileSync(bootstrapPath, renderBootstrapClient(config), "utf8");
}

/**
 * Create a bundle containing the client
 * pass config (paths.root, paths.bundle, isDev have to be defined)
 * @param {!Object} config
 */
function createBundle(config) {

    var paths = config.paths,
        bundleFolder = paths.bundle,
        bootstrapPath = bundleFolder + "/bootstrap.client.tmp.js";

    var webpackEvents = new EventEmitter();

    /*
    webpackEvents.on("module", function onWebpackModule(module, filename) {
        logger.debug("Including module " + filename);
    });
    */

    var webpackOptions = getWebpackOptions(config);

    generateTmpBootstrap(config, bootstrapPath);

    //additional settings
    webpackOptions.events = webpackEvents;

    webpack(bootstrapPath, webpackOptions, function onWebpackFinished(err, stats) {

        //remove tmp bootstrap after bundling
        removeTmpBootstrap(bootstrapPath);

        logger.debug("\n" +
            formatOutput(stats, {
                    colors: true,
                    context: webpackOptions.context
                }
            ));

        if (stats.errors.length === 0) {
            logger.info("Bundle created in " + stats.time/1000 + "s");
        } else {
            logger.error("Bundle creation failed ...");
            throw stats.errors[0];
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
        bootstrapPath = bundleFolder + "/bootstrap.client.tmp.js";

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

    generateTmpBootstrap(config, bootstrapPath);

    webpackOptions.events = middlewareEvents;
    //we enable watch mode for the dev server
    //rebundling can be enabled by setting "watch : false"
    webpackOptions.watch = true;

    return webpackMiddleware(__dirname, bootstrapPath, {
        quiet: true,
        context: webpackOptions.context,
        webpack: webpackOptions
    });
}

exports.getWebpackOptions = getWebpackOptions;
exports.generateTmpBootstrap = generateTmpBootstrap;
exports.removeTmpBootstrap = removeTmpBootstrap;
exports.createBundle = createBundle;
exports.initServeBundleMiddleware = initServeBundleMiddleware;

