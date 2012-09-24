"use strict"; // run code in ES5 strict mode

var webpack = require("webpack"),
    EventEmitter = require("events").EventEmitter,
    resolveFilename = require("./resolveFilename.js"),
    nodeclassLoader = require("nodeclass").bundlers.webpack,
    fs = require("fs"),
    fshelpers = require("fshelpers"),
    renderBootstrapClient = require("./renderBootstrapClient.js"),
    renderFillPageRegistry = require("./renderFillPageRegistry.js"),
    renderFillServiceRegistry = require("./renderFillServiceRegistry.js"),
    renderFillSchemaRegistry = require("./renderFillSchemaRegistry.js"),
    renderFillModelRegistry = require("./renderFillModelRegistry.js"),
    logger = require("../../shared/logger.js").get("bundle"),
    _ = require("underscore");

/**
 * Outputs various files into the path specified by config.paths.bundle.
 * The callback gets called with (err, stats) returned by webpack.
 * @see https://github.com/webpack/webpack
 *
 * @param {!Config} config the alamid config
 * @param {!Function} callback will be called with err and a stats object
 */
function createBundle(config, callback) {
    var webpackEvents,
        webpackOptions,
        paths = config.paths,
        tmpFolder = paths.bundle + "/tmp",
        bootstrapPath = tmpFolder + "/bootstrap.client.js",
        isDev = config.isDev,
        htmlExt = require.extensions[".html"],
        cssExt = require.extensions[".css"];


    // Replace current extension handlers with dummy extension handlers.
    // This is necessary so the nodeclass compilation doesn't fail when requiring browser-only files.
    if (!htmlExt) {
        require.extensions[".html"] = handleExtension;
    }
    if (!cssExt) {
        require.extensions[".css"] = handleExtension;
    }

    logger.info("Creating bundle into '" + paths.bundle + "'");
    initTmpFolder(tmpFolder);
    logger.debug("Generating '" + bootstrapPath + "'");
    generateTmpModules(config, tmpFolder);

    webpackEvents = new EventEmitter();
    webpackEvents.on("module", function onWebpackModule(module, filename) {
        logger.debug("Including module " + filename);
    });

    resolveFilename.statCache = {}; // reset fs.stat cache

    webpackOptions = {
        events: webpackEvents,
        output: paths.bundle + "/app.js",
        context: paths.root,
        includeFilenames: isDev,
        debug: isDev,
        extensions: ["", ".client.js", ".js"],
        resolve: {
            loaders: [
                nodeclassLoader,
                { test: /\.html$/i, loader: "raw" }
            ],
            postprocess: {
                normal: [resolveFilename]
            }
        }
    };

    webpack(bootstrapPath, webpackOptions, function onWebpackFinished(err, stats) {
        if (stats.errors.length === 0) {
            logger.info("Bundle created in " + stats.time/1000 + "s");
        } else {
            logger.error("Bundle creation failed ...");
            throw stats.errors[0];
        }

        if (!htmlExt) {
            delete require.extensions[".html"];
        }
        if (!cssExt) {
            delete require.extensions[".css"];
        }

        removeTmpFolder(tmpFolder);
        callback(err, stats);
    });
}

/**
 * Removes the tmpFolder if it already exists and creates it again
 *
 * @param {!String} tmpFolder
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
 * @param {!String} tmpFolder
 */
function removeTmpFolder(tmpFolder) {
    logger.debug("Removing temp-folder '" + tmpFolder + "'");
    fshelpers.removeSync(tmpFolder);
}

/**
 * Generates temporary modules like the bootstrap.client.js
 *
 * @param {!Object} config
 * @param {!String} outputPath
 */
function generateTmpModules(config, outputPath) {
    var paths = config.paths,
        bootstrapClientSrc = renderBootstrapClient(config),
        fillPageRegistrySrc = renderFillPageRegistry(paths.pages),
        fillServiceRegistrySrc = renderFillServiceRegistry(paths.services),
        fillSchemaRegistrySrc = renderFillSchemaRegistry(paths.schemas),
        fillModelRegistrySrc = renderFillModelRegistry(paths.models);

    fs.writeFileSync(outputPath + "/fillPageRegistry.js", fillPageRegistrySrc, "utf8");
    fs.writeFileSync(outputPath + "/fillServiceRegistry.js", fillServiceRegistrySrc, "utf8");
    fs.writeFileSync(outputPath + "/fillSchemaRegistry.js", fillSchemaRegistrySrc, "utf8");
    fs.writeFileSync(outputPath + "/fillModelRegistry.js", fillModelRegistrySrc, "utf8");
    fs.writeFileSync(outputPath + "/bootstrap.client.js", bootstrapClientSrc, "utf8");
}

/**
 * A dummy extension handlers so browser-only requires don't break
 *
 * @param {Module} module
 */
function handleExtension(module) {
    module.exports = "Not available in node";
}

module.exports = createBundle;