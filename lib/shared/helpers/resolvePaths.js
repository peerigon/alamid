"use strict"; // run code in ES5 strict mode

var pathUtil = require("path");

function getAppPaths(path) {
    return {
        root: path,
        app: path + "/app",
        models: path + "/app/models",
        services: path + "/app/services",
        schemas: path + "/app/schemas",
        views: path + "/app/views",
        pages: path + "/app/pages",
        config: path + "/app/config.json",
        statics: path + "/statics",
        bundle: path + "/bundle",
        html: path + "/statics/html"
    };
}

function getPageDataLoaderPath(pageClassPath) {
    var pageDir = pathUtil.dirname(pageClassPath),
        pageName = pathUtil.basename(pageClassPath, ".class.js");

    pageName = pageName.charAt(0).toLowerCase() + pageName.substr(1);

    return pageDir + "/" + pageName + "DataLoader.js";
}

exports.getAppPaths = getAppPaths;
exports.getPageDataLoaderPath = getPageDataLoaderPath;