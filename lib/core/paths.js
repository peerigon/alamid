"use strict";

var pathUtil = require("path");

var modifiers,
    filters,
    patterns;

patterns = {    // functions are used, so the regular expression object is always new
    jsFiles: function jsFiles() { return /\.js$/gi; },
    nodeModules: function nodeModules() { return /.*node_modules\//gi; },
    classes: function classes() { return /\.class\.js$/gi; },
    alamidFiles: function alamidFiles() { return /node_modules\/alamid\/.*\.js/gi; },
    serverFiles: function serverFiles() { return /\.server(\.class)?\.js$/gi; },
    clientFiles: function clientFiles() { return /\.client(\.class)?\.js$/gi; }
};

modifiers = {
    normalize: pathUtil.normalize,
    nodeModules: function nodeModules(path) {
        if (path.charAt(0) === ".") {
            return path;
        } else {
            path = path.replace(patterns.nodeModules(), "node_modules/");
            path = pathUtil.normalize(path);
            return path;
        }
    }
};

filters = {
    noClasses: function noClasses(path) {
        return patterns.classes().test(path) === false;
    },
    onlyClasses: function onlyClasses(path) {
        return patterns.classes().test(path);
    },
    noAlamidFiles: function noAlamidFiles(path) {
        return patterns.alamidFiles().test(path) === false;
    },
    noServerFiles: function noServerFiles(path) {
        return patterns.serverFiles().test(path) === false;
    },
    onlyServerFiles: function onlyServerFiles(path) {
        return patterns.serverFiles().test(path);
    },
    noClientFiles: function noClientFiles(path) {
        return patterns.clientFiles().test(path) === false;
    },
    onlyClientFiles: function onlyClientFiles(path) {
        return patterns.clientFiles().test(path);
    }
};

function getPathFilterAndModifier(filtersToApply, modifiersToApply) {
    return function pathFilterAndModifier(path) {
        var i,
            func;

        if (filtersToApply) {
            for (i = 0; i < filtersToApply.length; i++) {
                func = filters[filtersToApply[i]];
                if (func(path) === false) {
                    return false;
                }
            }
        }
        if (modifiersToApply) {
            for (i = 0; i < modifiersToApply.length; i++) {
                func = modifiers[modifiersToApply[i]];
                path = func(path);
            }
            return path;
        } else {
            return true;
        }
    };
}

function getPaths(path) {
    return {
        app: path,
        srcPath: path + "/src",
        compiledPath: path + "/compiled",
        models: path + "/compiled/models",
        pages: path + "/compiled/pages",
        scripts: path + "/compiled/scripts",
        services: path + "/compiled/services",
        validators: path + "/compiled/validators",
        views: path + "/compiled/views",
        config: path + "/config.json",
        statics: path + "/statics",
        cache: path + "/cache",
        html: path + "/statics/html"
    };
}

exports.modifiers = modifiers;
exports.filters = filters;
exports.patterns = patterns;
exports.getPathFilterAndModifier = getPathFilterAndModifier;
exports.getPaths = getPaths;
