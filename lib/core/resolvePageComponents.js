"use strict"; // run code in ES5 strict mode

var Finder = require("fshelpers").Finder,
    browserify = require("browserify"),
    pathUtil = require("path"),
    paths = require("../shared/helpers/pathHelpers.js"),
    _ = require("underscore");

var types = ["models", "services", "schemas", "pages", "views"];

function resolveDisplayObject(path) {
    var obj = {},
        htmlFile = path.slice(0, -".class.js".length) + ".html";

    obj.classFile = path;
    obj.htmlFile = htmlFile;

    return obj;
}

function resolveModelSchemaService(path) {
    var obj = {},
        pathSplit,
        fileNameWithoutBase;

    pathSplit = path.split(pathUtil.sep);
    pathSplit.pop();    // pop "models", "services" or "schemas"
    fileNameWithoutBase = pathUtil.sep + pathSplit.join(pathUtil.sep);  // will be something like /blog/blogPost/BlogPostService.class.js
    obj.model = "models" + fileNameWithoutBasePath;
    obj.schema = "schemas" + fileNameWithoutBasePath;
    obj.service = "services" + pathUtil.sep + pathSplit.join(pathUtil.sep);

}

function detectType(bundlePaths, path) {
    var type,
        i;

    for (i = 0; i < types.length; i++) {
        type = types[i];
        if (path.indexOf(bundlePaths[type]) === 0) {
            return type;
        }
    }

    return null;
}

function resolvePageComponents(folder, callback) {
    var finder = new Finder(),
        bundlePaths = paths.getPaths(folder);

    folder = paths.sanitizeDirname(folder);

    finder
        .on("file", function onFile(path) {
            var type = detectType(bundlePaths, path),
                pathWithoutBase = path.slice(0, folder.length + 1);

            if (type) {
                if (type === "pages" || type === "views") {
                    resolveDisplayObject(pathWithoutBase);
                } else {
                    resolveModelSchemaService(pathWithoutBase);
                }
            }
        })
        .on("error", function onError(err) {
            throw err;
        })
        .walk(folder);
}

module.exports = resolvePageComponents;