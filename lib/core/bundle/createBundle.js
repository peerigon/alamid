"use strict"; // run code in ES5 strict mode

var webpack = require("webpack"),
    EventEmitter = require("events").EventEmitter,
    resolveFilename = require("./resolveFilename.js"),
    nodeclassLoader = require("nodeclass").bundlers.webpack,
    fs = require("fs"),
    fshelpers = require("fshelpers"),
    config = require("../../shared/config.js"),
    renderBootstrapClient = require("./renderBootstrapClient.js"),
    renderFillPageRegistry = require("./renderFillPageRegistry.js"),
    renderFillServiceRegistry = require("./renderFillServiceRegistry.js"),
    renderFillSchemaRegistry = require("./renderFillSchemaRegistry.js"),
    renderFillModelRegistry = require("./renderFillModelRegistry.js"),
    logger = require("../../shared/logger.js").get("bundle"),
    _ = require("underscore");

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

    // Replace the current js extension handler with our own,
    // so nodeclass requires exactly the same files as webpack would
    require.extensions[".js"] = handleJSExtension;

    // Replace current extension handlers with dummy extension handlers.
    // This is necessary so the nodeclass compilation doesn't fail when requiring browser-only files.
    require.extensions[".html"] = handleBrowserOnlyExtension;
    require.extensions[".css"] = handleBrowserOnlyExtension;

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
        context: paths.root,
        includeFilenames: isDev,
        debug: isDev,
        extensions: ["", ".client.js", ".js"],
        preLoaders: [nodeclassLoader],
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
function handleBrowserOnlyExtension(module) {
    module.exports = "Not available in node";
}

/**
 * Calls resolveFilename so all require()s are done in the exact same way as webpack does.
 *
 * @param {Module} module
 * @param {String} filename
 */
function handleJSExtension(module, filename) {
    var content;

    resolveFilename(filename, function (err, filename) {
        if (err) {
            throw err;
        }
        content = fs.readFileSync(filename, "utf8");
        module._compile(stripBOM(content), filename);
    });
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 * because the buffer-to-string conversion in `fs.readFileSync()`
 * translates it to FEFF, the UTF-16 BOM.
 *
 * This function is taken from node's core
 * @see https://github.com/joyent/node/blob/master/lib/module.js
 *
 * @param {String} content
 * @return {String}
 */
function stripBOM(content) {

  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

// Self executing module
createBundle();