"use strict"; // run code in ES5 strict mode

var pathUtil = require("path"),
    pathHelpers = require("./pathHelpers.js");

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

function getModelCompPaths(appPaths, modelUrl) {
    var basePath,
        pathSplit,
        modelName,
        obj = {};

    modelUrl = pathHelpers.modifiers.sanitizeDirname(modelUrl);
    pathSplit = modelUrl.split("/");
    modelName = pathSplit.pop();
    basePath = pathUtil.normalize(appPaths.models + "/" + pathSplit.join("/"));
    basePath = modelName;

    if (process.title === "node") {
        obj.modelPath = [
            basePath + "/" + modelName + ".server.class.js",
            basePath + "/" + modelName + ".class.js"
        ];
        obj.schemaPath = [
            basePath + "/" + modelName + "Schema.server.js",
            basePath + "/" + modelName + "Schema.js"
        ];
    } else {
        obj.modelPath = [
            basePath + "/" + modelName + ".client.class.js",
            basePath + "/" + modelName + ".class.js"
        ];
        obj.schemaPath = [
            basePath + "/" + modelName + "Schema.client.js",
            basePath + "/" + modelName + "Schema.js"
        ];
    }

    return obj;
}


/**
 * Convert a request-Path to the actual file-path of the Service
 * @param {!String} requestPath
 * @return {String}
 */
function resolvePathToServiceFilePath(requestPath) {

    var resPath,
        pathSplits,
        servicePath;

    pathSplits = requestPath.split("/");
    servicePath = pathSplits[pathSplits.length - 1];

    //first part
    resPath = requestPath + "/" + servicePath + "Service.server.class.js";

    return resPath;
}

/**
 * Convert a request-Path to the actual file-path of the Model
 * @param {!String} requestPath
 * @return {String}
 */
function resolvePathToModelFilePath(requestPath) {

    var resPath,
        pathSplits,
        modelPath;

    pathSplits = requestPath.split("/");
    modelPath = pathSplits[pathSplits.length - 1];

    //uppercase for classes
    resPath = requestPath + "/" + modelPath.charAt(0).toUpperCase() + modelPath.substr(1, modelPath.length) + ".server.class.js";

    return resPath;
}



exports.getAppPaths = getAppPaths;
exports.getModelCompPaths = getModelCompPaths;
exports.resolvePathToModelFilePath = resolvePathToModelFilePath;
exports.resolvePathToServiceFilePath = resolvePathToServiceFilePath;
