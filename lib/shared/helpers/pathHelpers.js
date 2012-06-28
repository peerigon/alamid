"use strict";

var pathUtil = require("path");

var modifiers,
    filters,
    patterns;

patterns = {    // functions are used to ensure that the regular expression object is always new
    jsFile: function jsFiles() { return /\.js$/gi; },
    nodeModules: function nodeModules() { return /.*node_modules\//gi; },
    classFile: function classes() { return /\.class\.js$/gi; },
    alamidFile: function alamidFiles() { return /node_modules\/alamid\/.*\.js/gi; },
    serverFile: function serverFiles() { return /\.server(\.class)?\.js$/gi; },
    clientFile: function clientFiles() { return /\.client(\.class)?\.js$/gi; },
    serviceUrl: function servicePath() { return /^services\/.+/gi; },
    validatorUrl: function servicePath() { return /^validators\/.+/gi; }
};

modifiers = {
    normalize: pathUtil.normalize,
    trailingSlash: function (path) {
        if (path.charAt(path.length - 1) !== "/") {
            path = path + "/";
        }

        return path;
    },
    noTrailingSlash: function (path) {
        if (path.charAt(path.length - 1) === "/") {
            path = path.slice(0, -1);
        }

        return path;
    },
    leadingSlash: function (path) {
        if (path.charAt(0) !== "/") {
            path = "/" + path;
        }

        return path;
    },
    noLeadingSlash: function (path) {
        if (path.charAt(0) === "/") {
            path = path.slice(1);
        }

        return path;
    }
};

filters = {
    noClasses: function noClasses(path) {
        return patterns.classFile().test(path) === false;
    },
    onlyClasses: function onlyClasses(path) {
        return patterns.classFile().test(path);
    },
    noAlamidFiles: function noAlamidFiles(path) {
        return patterns.alamidFile().test(path) === false;
    },
    noServerFiles: function noServerFiles(path) {
        return patterns.serverFile().test(path) === false;
    },
    onlyServerFiles: function onlyServerFiles(path) {
        return patterns.serverFile().test(path);
    },
    noClientFiles: function noClientFiles(path) {
        return patterns.clientFile().test(path) === false;
    },
    onlyClientFiles: function onlyClientFiles(path) {
        return patterns.clientFile().test(path);
    },
    noServiceUrl: function noServicePathFiles(path) {
        return patterns.serviceUrl().test(path) === false;
    },
    onlyServiceUrl: function onlyServicePath(path) {
        return patterns.serviceUrl().test(path);
    },
    noValidatorUrl: function noValidatorPath(path) {
        return patterns.validatorUrl().test(path) === false;
    },
    onlyValidatorUrl: function onlyValidatorPath(path) {
        return patterns.validatorUrl().test(path);
    }
};

function FilterModifierChain(path) {
    var i,
        func,
        result,
        filtersToApply = [],
        modifiersToApply = [];

    function applyFilter() {
        path = arguments[0] || path;
        if (filtersToApply) {
            for (i = 0; i < filtersToApply.length; i++) {
                func = filtersToApply[i];
                result = func(path);
                if (typeof result !== "boolean") {
                    throw new TypeError("(alamid) Cannot apply path filter: A filter should return only true or false. Instead it returned '" + typeof result + "'");
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

    applyFilter.filter = function (filter1, filter2, etc) {
        for (i = 0; i < arguments.length; i++) {
            func = arguments[i];
            if (typeof func === "string") {
                func = filters[func];
                if (func === undefined) {
                    throw new Error("(alamid) Cannot use filter: Unknown filter name '" + arguments[i] + "'");
                }
                filtersToApply.push(func);
            } else if (typeof func === "function") {
                filtersToApply.push(func);
            } else {
                throw new TypeError("(alamid) Cannot use filter: Expected a filter name or arbitrary function as a filter. Instead saw '" + typeof func + "'");
            }
        }
        if (i === 0) {
            throw new Error("(alamid) Cannot use filter: You haven't passed a name or function as a filter");
        }

        return applyFilter;
    };

    applyFilter.modifier = function (modifier1, modifier2, etc) {
        for (i = 0; i < arguments.length; i++) {
            func = arguments[i];
            if (typeof func === "string") {
                func = filters[func];
                if (func === undefined) {
                    throw new Error("(alamid) Cannot use modifier: Unknown modifier name '" + arguments[i] + "'");
                }
                modifiersToApply.push(func);
            } else if (typeof func === "function") {
                modifiersToApply.push(func);
            } else {
                throw new TypeError("(alamid) Cannot use modifier: Expected a modifier name or arbitrary function as a modifier. Instead saw '" + typeof func) + "'";
            }
        }
        if (i === 0) {
            throw new Error("(alamid) Cannot use modifier: You haven't passed a modifier name or function as a modifier");
        }

        return applyFilter;
    };

    return applyFilter;
}



exports.modifiers = modifiers;
exports.filters = filters;
exports.patterns = patterns;
exports.use = {
    filter: function () {
        var chain = new FilterModifierChain();
        return chain.filter.apply(chain, arguments);
    },
    modifier: function () {
        var chain = new FilterModifierChain();
        return chain.modifier.apply(chain, arguments);
    }
};
exports.applyOn = function (path) {
    return {
        filter: function () {
            var chain = new FilterModifierChain(path);
            return chain.filter.apply(chain, arguments);
        },
        modifier: function () {
            var chain = new FilterModifierChain(path);
            return chain.modifier.apply(chain, arguments);
        }
    };
};