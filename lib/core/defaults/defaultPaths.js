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

exports.getAppPaths = getAppPaths;
