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

/**
 * Outputs various files into the path specified by config.paths.bundle.
 *
 * WARNING:
 * This function needs a clean require.cache and modifies the require.extensions-Object.
 * Thus it is necessary to run this module in its own process. Don't include this module
 * directly in your node program.
 */
function createBundle() {
    var webpackEvents,
        webpackOptions,
        paths = config.paths,
        bundleFolder = paths.bundle,
        bootstrapPath = bundleFolder + "/bootstrap.client.tmp.js",
        isDev = config.isDev;

    console.log(config);

    logger.info("Creating bundle into '" + bundleFolder + "'");
    logger.debug("Generating '" + bootstrapPath + "'");

    generateTmpBootstrap(config, bootstrapPath);

    webpackEvents = new EventEmitter();
    webpackEvents.on("module", function onWebpackModule(module, filename) {
        logger.debug("Including module " + filename);
    });

    // Reset fs.stat cache
    // @see resolveFilename-Module
    resolveFilename.statCache = {};

    webpackOptions = {
        events: webpackEvents,
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

// Self executing module
createBundle();