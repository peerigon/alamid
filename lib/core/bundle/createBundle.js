"use strict"; // run code in ES5 strict mode

var webpack = require("webpack"),
    getAppPaths = require("../../shared/helpers/resolvePaths.js").getAppPaths,
    fs = require("fs"),
    fshelpers = require("fshelpers"),
    renderBootstrapClient = require("./renderBootstrapClient.js"),
    renderFillPageRegistry = require("./renderFillPageRegistry.js"),
    config = require("../config");

function generateTmpModules(paths, outputPath) {
    var bootstrapClientSrc = renderBootstrapClient(config),
        fillPageRegistrySrc = renderFillPageRegistry(paths.pages);

    fs.writeFileSync(outputPath + "/fillPageRegistry.js", fillPageRegistrySrc, "utf8");
    fs.writeFileSync(outputPath + "/bootstrap.client.js", bootstrapClientSrc, "utf8");
}

function createBundle(appFolder) {
    var paths = getAppPaths(appFolder),
        tmpFolder = paths.bundle + "/tmp";

    // Init tmp folder
    if (fs.existsSync(tmpFolder)) {
        fshelpers.removeSync(tmpFolder);
    }
    fshelpers.makeDirSync(tmpFolder);

    generateTmpModules(paths, tmpFolder);
}

module.exports = createBundle;