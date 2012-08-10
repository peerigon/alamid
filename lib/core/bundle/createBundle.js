"use strict"; // run code in ES5 strict mode

var webpack = require("webpack"),
    getAppPaths = require("../../shared/helpers/resolvePaths.js").getAppPaths,
    makeDirSync = require("fshelpers");

function createBundle(appFolder) {
    var paths = getAppPaths(appFolder),
        tmpFolder = paths.bundle + "/tmp";

    makeDirSync(tmpFolder);


}

module.exports = createBundle;