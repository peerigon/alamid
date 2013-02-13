"use strict"; // run code in ES5 strict mode

var pathUtil = require("path");

function getAppPaths(path) {
    return {
        root: path,
        app: pathUtil.join(path, "app"),
        models: pathUtil.join(path, "app", "models"),
        services: pathUtil.join(path, "app", "services"),
        schemas: pathUtil.join(path, "app", "models"),
        views: pathUtil.join(path, "app", "views"),
        pages: pathUtil.join(path, "app", "pages"),
        bundle: pathUtil.join(path, "bundle")
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
