"use strict"; // run code in ES5 strict mode

var webpack = require("webpack"),
    formatOutput = require("webpack/lib/formatOutput"),
    EventEmitter = require("events").EventEmitter,
    resolveFilename = require("./resolveFilename.js"),
    fs = require("fs"),
    fshelpers = require("fshelpers"),
    config = require("../../shared/config.js"),
    renderBootstrapClient = require("./renderBootstrapClient.js"),
    renderFillPageRegistry = require("./renderFillPageRegistry.js"),
    renderFillServiceRegistry = require("./renderFillServiceRegistry.js"),
    renderFillSchemaRegistry = require("./renderFillSchemaRegistry.js"),
    renderFillModelRegistry = require("./renderFillModelRegistry.js"),
    logger = require("../../shared/logger.js").get("bundle");

/**
 * Outputs various files into the path specified by config.paths.bundle.
 *
 * WARNING:
 * This function needs a clean require.cache and modifies the require.extesions-Object.
 * Thus it is necessary to run this module in its own process. Don't include this module
 * directly in your node program.
 */
function createBundle() {
    var webpackEvents,
        webpackOptions,
        paths = config.paths,
        tmpFolder = paths.bundle + "/tmp",
        bootstrapPath = tmpFolder + "/bootstrap.client.js",
        isDev = config.isDev;

    logger.info("Creating bundle into '" + paths.bundle + "'");
    initTmpFolder(tmpFolder);
    logger.debug("Generating '" + bootstrapPath + "'");
    generateTmpModules(config, tmpFolder);

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
        removeTmpFolder(tmpFolder);

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
 * Removes the tmpFolder if it already exists and creates it again
 *
 * @param {String} tmpFolder
 */
function initTmpFolder(tmpFolder) {
    // Init tmp folder
    if (fs.existsSync(tmpFolder)) {
        logger.debug("Removing temp-folder '" + tmpFolder + "' before creating the bundle");
        fshelpers.removeSync(tmpFolder);
    }
    logger.debug("Creating temp-folder '" + tmpFolder + "'");
    fshelpers.makeDirSync(tmpFolder);
}

/**
 * Removes the tmpFolder
 *
 * @param {String} tmpFolder
 */
function removeTmpFolder(tmpFolder) {
    logger.debug("Removing temp-folder '" + tmpFolder + "'");
    fshelpers.removeSync(tmpFolder);
}

/**
 * Generates temporary modules like the bootstrap.client.js
 *
 * @param {Object} config
 * @param {String} outputPath
 */
function generateTmpModules(config, outputPath) {
    var paths = config.paths,
        bootstrapClientSrc = renderBootstrapClient(config),
        fillPageRegistrySrc = renderFillPageRegistry(paths.pages),
        fillServiceRegistrySrc = renderFillServiceRegistry(paths.services),
        fillSchemaRegistrySrc = renderFillSchemaRegistry(paths.schemas),
        fillModelRegistrySrc = renderFillModelRegistry(paths.models);

    //TODO use val-loader instead of writing to the fs
    fs.writeFileSync(outputPath + "/fillPageRegistry.js", fillPageRegistrySrc, "utf8");
    fs.writeFileSync(outputPath + "/fillServiceRegistry.js", fillServiceRegistrySrc, "utf8");
    fs.writeFileSync(outputPath + "/fillSchemaRegistry.js", fillSchemaRegistrySrc, "utf8");
    fs.writeFileSync(outputPath + "/fillModelRegistry.js", fillModelRegistrySrc, "utf8");
    fs.writeFileSync(outputPath + "/bootstrap.client.js", bootstrapClientSrc, "utf8");
}

// Self executing module
createBundle();