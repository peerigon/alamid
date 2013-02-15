"use strict";

var pathUtil = require("path");

var modifiers,
    filters,
    patterns;

/** @typedef {on: {FilterModifierChain}} */
var FilterModifierChain;

patterns = {    // functions are used to ensure that the regular expression object is always new

    /**
     * Matches all strings that end on ".js"
     *
     * @return {RegExp}
     */
    jsFile: function jsFiles() { return /\.js$/gi; },

    /**
     * Matches all strings that end on ".html"
     *
     * @return {RegExp}
     */
    htmlFile: function htmlFiles() { return /\.html$/gi; },

    /**
     * Matches all strings that contain "node_modules/"
     *
     * @return {RegExp}
     */
    nodeModules: function nodeModules() { return /.*node_modules\//gi; },

    /**
     * Matches all strings that end on ".class.js"
     *
     * @return {RegExp}
     */
    classFile: function classes() { return /\.class\.js$/gi; },

    /**
     * Matches all strings that contain "node_modules/alamid/"
     *
     * @return {RegExp}
     */
    alamidFile: function alamidFiles() { return /node_modules\/alamid\/.*\.js/gi; },

    /**
     * Matches all strings that end on ".server.js" or ".server.class.js"
     *
     * @return {RegExp}
     */
    serverFile: function serverFiles() { return /\.server(\.class)?\.js$/gi; },

    /**
     * Matches all strings that end on ".client.js" or ".client.class.js"
     *
     * @return {RegExp}
     */
    clientFile: function clientFiles() { return /\.client(\.class)?\.js$/gi; },

    /**
     * Matches all strings that contain "Service" and end on ".class.js" or ".js"
     *
     * @return {RegExp}
     */
    serviceFile: function serviceFiles() { return /Service(\.class)?\.js$/gi; },
    
    /**
     * Matches all strings that contain "Schema" end on ".class.js" or "js"
     *
     * @return {RegExp}
     */
    schemaFile: function serviceFiles() { return /Schema(\.server|\.client)?\.js$/gi; },

    /**
     * Matches all strings that begin with "services/" and continue with at least one char
     *
     * @return {RegExp}
     */
    serviceURL: function servicePath() { return /^services\/.+/gi; },

    /**
     * Matches all strings that begin with "validators/" and continue with at least one char
     *
     * @return {RegExp}
     */
    validatorURL: function servicePath() { return /^validators\/.+/gi; }
};

modifiers = {

    normalize: pathUtil.normalize,
    dirname: pathUtil.dirname,
    basename: pathUtil.basename,
    extname: pathUtil.extname,

    /**
     * Applies node's internal path.normalize and converts all path separators to /
     * 
     * @param {String} path
     * @return {String}
     */
    normalizeToUnix: function (path) {
        path = pathUtil.normalize(path);
        if (pathUtil.sep !== "/") {
            path = path.replace(/\\/g, "/");
        }

        return path;
    },

    /**
     * Adds a trailing slash at the end if not present
     *
     * @param {String} path
     * @return {String}
     */
    trailingSlash: function (path) {
        if (path.charAt(path.length - 1) !== "/") {
            path = path + "/";
        }

        return path;
    },

    /**
     * Removes a trailing slash at the end if not present
     *
     * @param {String} path
     * @return {String}
     */
    noTrailingSlash: function (path) {
        if (path.charAt(path.length - 1) === "/") {
            path = path.slice(0, -1);
        }

        return path;
    },

    /**
     * Adds a leading slash at the beginning if not present
     *
     * @param {String} path
     * @return {String}
     */
    leadingSlash: function (path) {
        if (path.charAt(0) !== "/") {
            path = "/" + path;
        }

        return path;
    },

    /**
     * Removes a trailing slash at the beginning if not present
     *
     * @param {String} path
     * @return {String}
     */
    noLeadingSlash: function (path) {
        if (path.charAt(0) === "/") {
            path = path.slice(1);
        }

        return path;
    }
};

filters = {

    /**
     * Returns true if the path ends on .html
     *
     * @param {String} path
     * @return {Boolean}
     */
    onlyHTMLFiles: function onlyHTMLFiles(path) {
        return patterns.htmlFile().test(path) === true;
    },

    /**
     * Returns false if the path is a class path
     *
     * @param {String} path
     * @return {Boolean}
     */
    noClassFiles: function noClasses(path) {
        return patterns.classFile().test(path) === false;
    },

    /**
     * Returns true if the path is a class path
     *
     * @param {String} path
     * @return {Boolean}
     */
    onlyClassFiles: function onlyClassFiles(path) {
        return patterns.classFile().test(path);
    },

    /**
     * Returns false if the path is an alamid file
     *
     * @param {String} path
     * @return {Boolean}
     */
    noAlamidFiles: function noAlamidFiles(path) {
        return patterns.alamidFile().test(path) === false;
    },

    /**
     * Returns false if the path is a server-only file
     *
     * @param {String} path
     * @return {Boolean}
     */
    noServerFiles: function noServerFiles(path) {
        return patterns.serverFile().test(path) === false;
    },

    /**
     * Returns true if the path is a server-only file
     *
     * @param {String} path
     * @return {Boolean}
     */
    onlyServerFiles: function onlyServerFiles(path) {
        return patterns.serverFile().test(path);
    },

    /**
     * Returns false if the path is a client-only file
     *
     * @param {String} path
     * @return {Boolean}
     */
    noClientFiles: function noClientFiles(path) {
        return patterns.clientFile().test(path) === false;
    },

    /**
     * Returns true if the path is a client-only file
     *
     * @param {String} path
     * @return {Boolean}
     */
    onlyClientFiles: function onlyClientFiles(path) {
        return patterns.clientFile().test(path);
    },

    /**
     * Returns false if the path is a service url
     *
     * @param {String} path
     * @return {Boolean}
     */
    noServiceURL: function noServicePathFiles(path) {
        return patterns.serviceURL().test(path) === false;
    },

    /**
     * Returns true if the path is a service url
     *
     * @param {String} path
     * @return {Boolean}
     */
    onlyServiceURL: function onlyServicePath(path) {
        return patterns.serviceURL().test(path);
    },

    /**
     * Returns false if the path is a validator url
     *
     * @param {String} path
     * @return {Boolean}
     */
    noValidatorURL: function noValidatorPath(path) {
        return patterns.validatorURL().test(path) === false;
    },

    /**
     * Returns true if the filename is a schema-file
     *
     * @param {String} path
     * @return {Boolean}
     */
    onlySchemaFiles: function onlySchemaFiles(path) {
        return patterns.schemaFile().test(path);
    },

    /**
     * Returns true if the filename is a schema-file
     *
     * @param {String} path
     * @return {Boolean}
     */
    onlyServiceFiles: function onlyServiceFiles(path) {
        return patterns.serviceFile().test(path);
    },
    /**
     * Returns true if the path is a validator url
     *
     * @param {String} path
     * @return {Boolean}
     */
    onlyValidatorURL: function onlyValidatorPath(path) {
        return patterns.validatorURL().test(path);
    }
};

/**
 * Allows you to chain filters and modifiers that work on a string
 *
 * Usage:
 *
 * var chain = getFilterModifierChain()
 *     .filter("noServerFiles", function (path) { return false; })
 *     .modifier("leadingSlash");
 *
 * This class is not exposed directly. It's intended to be used with
 * exports.chain or exports.apply.
 *
 * @return {FilterModifierChain}
 */
function getFilterModifierChain() {
    var i,
        func,
        result,
        filtersToApply = [],
        modifiersToApply = [];

    /**
     * Returns the modified string if it passed all filters and modifiers or just false if it
     * didn't pass a filter
     *
     * @param {String} path
     * @return {*}
     * @constructor
     */
    function FilterModifierChain(path) {
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

    /**
     * Circular reference on Chain to provide a more expressive way. For example:
     *
     * apply.filter("noClassFiles").on("myString");
     *
     * @type {FilterModifierChain}
     */
    FilterModifierChain.on = FilterModifierChain;

    /**
     * See below for a detailed description
     */
    FilterModifierChain.filter = function (filter1, filter2, etc) {
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

        return FilterModifierChain;
    };

    /**
     * See below for a detailed description
     */
    FilterModifierChain.modifier = function (modifier1, modifier2, etc) {
        for (i = 0; i < arguments.length; i++) {
            func = arguments[i];
            if (typeof func === "string") {
                func = modifiers[func];
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

        return FilterModifierChain;
    };

    return FilterModifierChain;
}

/**
 * Provides different functions to modify a path. These function accept a string as path
 * and return the new string
 *
 * @type {Object}
 */
exports.modifiers = modifiers;

/**
 * Provides different functions to filter a path. These function accept a string as path
 * and return the boolean result
 *
 * @type {Object}
 */
exports.filters = filters;

/**
 * Provides different functions that return "fresh" regular expressions
 *
 * @type {Object}
 */
exports.patterns = patterns;

/**
 * Returns a new instance of FilterModifierChain. You can use it to
 *
 * - get a reference for a chain: var myChain = pathHelpers.chain.filter("noClassFiles").modifier("normalize");
 * - apply a chain on a string: var myString = pathHelpers.apply.modifier("trailingSlash").on("/my/path");
 *
 * @type {Object}
 */
exports.chain = exports.apply = {

    /**
     * Stacks all filters for the chain
     *
     * @param {String|Function} filter1
     * @param {String|Function} filter2
     * @param {String|Function} etc
     * @return {FilterModifierChain}
     */
    filter: function (filter1, filter2, etc) {
        var chain = getFilterModifierChain();
        return chain.filter.apply(chain, arguments);
    },

    /**
     * Stacks all modifiers for the chain
     *
     * @param {String|Function} modifier1
     * @param {String|Function} modifier2
     * @param {String|Function} etc
     * @return {FilterModifierChain}
     */
    modifier: function (modifier1, modifier2, etc) {
        var chain = getFilterModifierChain();
        return chain.modifier.apply(chain, arguments);
    }
};