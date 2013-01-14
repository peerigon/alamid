"use strict"; // run code in ES5 strict mode

var webpack = require("webpack"),
    formatOutput = require("webpack/lib/formatOutput"),
    EventEmitter = require("events").EventEmitter,
    resolveFilename = require("./resolveFilename.js"),
    fs = require("fs"),
    fshelpers = require("fshelpers"),
    config = require("../../shared/config.js"),
    renderBootstrapClient = require("./renderer/renderBootstrapClient.js"),
    logger = require("../../shared/logger.js").get("bundle");

var paths = config.paths,
    bundleFolder = paths.bundle,
    bootstrapPath = bundleFolder + "/bootstrap.client.tmp.js";

var webpackEvents = new EventEmitter();
    webpackEvents.on("module", function onWebpackModule(module, filename) {
        logger.debug("Including module " + filename);
    });

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
 *
 * @param {Object} config
 * @param {String} bootstrapPath
 */
function generateTmpBootstrap(config, bootstrapPath) {
    fs.writeFileSync(bootstrapPath, renderBootstrapClient(config), "utf8");
}

function createBundle() {

    var webpackOptions = getWebpackOptions(config);

    generateTmpBootstrap(config, bootstrapPath);

    //additional settings
    webpackOptions.events = webpackEvents;

    webpack(bootstrapPath, webpackOptions, function onWebpackFinished(err, stats) {
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

function initServeBundleMiddleware() {

    var webpackMiddleware = require("webpack-dev-middleware");

    generateTmpBootstrap(config, bootstrapPath);

    var webpackOptions = getWebpackOptions(config);

    webpackOptions.events = webpackEvents;

    //webpackOptions.watch = true;
    console.log(webpackOptions);

    return webpackMiddleware(__dirname, bootstrapPath, {

        watch : true,
        debug : true,
        noInfo: false,
        quiet: false,
        colors: true,
        //verbose: false,
        context: webpackOptions.context,
        // webpack options
        webpack: webpackOptions
    });
}

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

exports.createBundle = createBundle;
exports.initServeBundleMiddleware = initServeBundleMiddleware;
exports.getWebpackOptions = getWebpackOptions;
