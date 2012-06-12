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

function FilterModifierChain() {
    var i,
        func,
        result,
        filtersToApply = [],
        modifiersToApply = [];

    function applyFilter(path) {
        if (filtersToApply) {
            for (i = 0; i < filtersToApply.length; i++) {
                func = filtersToApply[i];
                result = func(path);
                if (typeof result !== "boolean") {
                    throw new TypeError("A filter should return only true or false. Instead it returned " + typeof result);
                }
                if (result === false) {
                    return false;
                }
            }
        }
        if (modifiersToApply) {
            for (i = 0; i < modifiersToApply.length; i++) {
                func = modifiersToApply[i];
                path = func(path);
            }
            return path;
        } else {
            return true;
        }
    }

    applyFilter.filters = function (filter1, filter2, etc) {
        for (i = 0; i < arguments.length; i++) {
            func = arguments[i];
            if (typeof func === "function") {
                filtersToApply.push(func);
            } else {
                throw new TypeError("Expected a function as a filter. Instead saw " + typeof func);
            }
        }
        if (i === 0) {
            throw new Error("You haven't passed a filter");
        }

        return applyFilter;
    };

    applyFilter.modifiers = function (modifier1, modifier2, etc) {
        for (i = 0; i < arguments.length; i++) {
            func = arguments[i];
            if (typeof func === "function") {
                modifiersToApply.push(func);
            } else {
                throw new TypeError("Expected a function as a modifier. Instead saw " + typeof func);
            }
        }
        if (i === 0) {
            throw new Error("You haven't passed a modifier");
        }

        return applyFilter;
    };

    return applyFilter;
}



exports.modifiers = modifiers;
exports.filters = filters;
exports.patterns = patterns;
exports.use = {
    filters: function () {
        var chain = new FilterModifierChain();
        return chain.filters.apply(chain, arguments);
    },
    modifiers: function () {
        var chain = new FilterModifierChain();
        return chain.modifiers.apply(chain, arguments);
    }
};
exports.getPaths = getPaths;
