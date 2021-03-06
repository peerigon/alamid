"use strict";

var fs = require("fs"),
    pathUtil = require("path"),
    nodeModulesDir = pathUtil.resolve(__dirname, "../../../node_modules");

module.exports = function createFakePackageJSON(done) {
    var fakePackageJSON = '{ "main": "../../lib/index.js" }';

    fs.mkdir(nodeModulesDir, function onMkDirNodeModules() {
        fs.mkdir(nodeModulesDir + "/alamid", function onRewireMkDir() {
            fs.writeFile(nodeModulesDir + "/alamid/package.json", fakePackageJSON, "utf8", done);
        });
    });
};