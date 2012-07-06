"use strict"; // run code in ES5 strict mode

var pathUtil = require("path"),
    pathHelpers = require("./pathHelpers.js");

function getAppPaths(path) {
    return {
        root: path,
        app: path + "/app",
        compiled: path + "/compiled",
        models: path + "/compiled/models",
        services: path + "/compiled/services",
        schemas: path + "/compiled/schemas",
        views: path + "/compiled/views",
        pages: path + "/compiled/pages",
        config: path + "/config.json",
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

function getModelPathFromRequestPath(requestPath, ids) {

    var resPath,
        pathSplits,
        modelPath;

    pathSplits = requestPath.split("/");
    modelPath = pathSplits[pathSplits.length - 1];

    //first part
    resPath = requestPath.substr(0, requestPath.length - modelPath.length);
    //resPath += modelPath + "/" + modelPath + ".server.class.js";
    resPath += modelPath;

    return resPath;
}

/**
 * Convert a request-Path to the actual file-path of the Service
 * @param {!String} requestPath
 * @return {String}
 */
function resolveRequestToServiceFilePath(requestPath) {

    var resPath,
        pathSplits,
        servicePath;

    pathSplits = requestPath.split("/");
    servicePath = pathSplits[pathSplits.length - 1];

    //first part
    resPath = requestPath.substr(0, requestPath.length - servicePath.length);
    resPath += servicePath + "/" + servicePath + "Service.server.class.js";

    return resPath;
}


exports.getAppPaths = getAppPaths;
exports.getModelPathFromRequestPath = getModelPathFromRequestPath;
exports.resolveRequestToServiceFilePath = resolveRequestToServiceFilePath;
exports.getModelCompPaths = getModelCompPaths;