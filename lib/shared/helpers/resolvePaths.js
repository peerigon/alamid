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

function getPagePaths(templatePath) {
    var dir = pathUtil.dirname(templatePath),
        pageName = pathUtil.basename(templatePath, ".html"),
        pageNameLo;

    pageNameLo = pageName.charAt(0).toLowerCase() + pageName.substr(1);

    return {
        template: templatePath,
        Class: dir + "/" + pageName + ".class.js",
        dataLoader: dir + "/" + pageNameLo + "DataLoader.js"
    };
}

exports.getAppPaths = getAppPaths;
exports.getPagePaths = getPagePaths;