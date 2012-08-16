"use strict"; // run code in ES5 strict mode

var webpack = require("webpack"),
    resolveFilename = require("./resolveFilename.js"),
    nodeclassLoader = require("nodeclass").bundlers.webpack,
    fs = require("fs"),
    fshelpers = require("fshelpers"),
    renderBootstrapClient = require("./renderBootstrapClient.js"),
    renderFillPageRegistry = require("./renderFillPageRegistry.js"),
    renderFillServiceRegistry = require("./renderFillServiceRegistry.js"),
    renderFillSchemaRegistry = require("./renderFillSchemaRegistry.js"),
    renderFillModelRegistry = require("./renderFillModelRegistry.js"),
    _ = require("underscore");

var extHandlers = {
    ".html": handleHTMLFile
};

function createBundle(config, callback) {
    var paths = config.paths,
        tmpFolder = paths.bundle + "/tmp",
        isDev = config.isDev,
        initialExtHandlers;

    initTmpFolder(tmpFolder);
    generateTmpModules(config, tmpFolder);
    initialExtHandlers = applyExtHandlers();

    webpack(tmpFolder + "/bootstrap.client.js", {
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
    }, function onWebpackFinished(err, stats) {

        restoreInitExtHandlers(initialExtHandlers);
        removeTmpFolder(tmpFolder);
        callback(err, stats);

    });
}

function initTmpFolder(tmpFolder) {
    // Init tmp folder
    if (fs.existsSync(tmpFolder)) {
        fshelpers.removeSync(tmpFolder);
    }
    fshelpers.makeDirSync(tmpFolder);
}

function removeTmpFolder(tmpFolder) {
    fshelpers.removeSync(tmpFolder);
}

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

function handleHTMLFile(module) {
    module.exports = "Not available in node";
}

function applyExtHandlers() {
    var initialExtHandlers = {};

    _(require.extensions).each(function (handler, key) {
        initialExtHandlers[key] = handler;
    });
    _(extHandlers).each(function (handler, key) {
        require.extensions[key] = extHandlers[key];
    });

    return initialExtHandlers;
}

function restoreInitExtHandlers(initialExtHandlers) {
    var initialHandler;

    _(require.extensions).each(function restoreInitialExtHandler(handler, key) {
        initialHandler = initialExtHandlers[key];

        if (initialHandler) {
            require.extensions[key] = initialHandler;
        } else {
            delete require.extensions[key];
        }
    });
}

module.exports = createBundle;