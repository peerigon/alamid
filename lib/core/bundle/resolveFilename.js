"use strict"; // run code in ES5 strict mode

var fs = require("fs"),
    pathHelpers = require("../../shared/helpers/pathHelpers.js");

/**
 * Resolves the real path for a filename using fs.realpathSync.
 *
 * If a .server-filename is found, it will try to load instead:
 * 1. a .client-filename if present
 * 2. just the filename without postfix.
 *
 * logger.js -> logger.js (shared)
 * logger.server.js -> logger.client.js
 * myClass.server.class.js -> myClass.client.class.js
 *
 * @param {!String} filename
 * @param {!Function} callback
 */
function resolveFilename(filename, callback) {
    var filenameArr = filename.split("!"),
        modulePath = filenameArr.pop(), // remove loader paths for resolving the realpath
        realModulePath,
        clientFilename,
        sharedFilename;

    function onResolveFilenameFinished() {
        filenameArr.push(realModulePath);
        filename = filenameArr.join("!");
        callback(null, filename);
    }

    realModulePath = resolveRealPath(modulePath);

    if (realModulePath === null) {
        callback(new Error("(alamid) Cannot find module '" + modulePath + "'"));
        return;
    }

    //ALAMID MODULES
    //SERVER
    if(realModulePath.indexOf("lib/server") !== -1 && /\.server(\.class)?\.js$/i.test(realModulePath) === true) {

        realModulePath = realModulePath.replace(/lib\/server/i, "lib/client");
        realModulePath = realModulePath.replace(/\.server/, ".client");

        realModulePath = resolveRealPath(realModulePath);

        if (realModulePath) {
            onResolveFilenameFinished();
        } else {
            callback(new Error("(alamid) Cannot find bended module '" + realModulePath + "' - original file:  '" + modulePath + "'"));
        }
        return;
    }

    //CORE
    if(realModulePath.indexOf("lib/core") !== -1 && /\.server(\.class)?\.js$/i.test(realModulePath) === true) {

        realModulePath = realModulePath.replace(/lib\/core/i, "lib/client");
        realModulePath = realModulePath.replace(/\.server/, ".client");

        realModulePath = resolveRealPath(realModulePath);

        if (realModulePath) {
            onResolveFilenameFinished();
        } else {
            callback(new Error("(alamid) Cannot find bended module '" + realModulePath + "' - original file: '" + modulePath + "'"));
        }
        return;
    }

    //NON ALAMID modules
    if (/\.server(\.class)?\.js$/i.test(realModulePath) === false) {
        if (realModulePath) {
            onResolveFilenameFinished();
        } else {
            callback(new Error("(alamid) Cannot find bended module '" + realModulePath + "' - original file: '" + modulePath + "'"));
        }
        return;
    }

    clientFilename = modulePath.replace(/\.server(\.class)?\.js$/i, ".client$1.js");
    realModulePath = resolveRealPath(clientFilename);
    if (realModulePath) {
        onResolveFilenameFinished();
        return;
    }

    sharedFilename = modulePath.replace(/\.server(\.class)?\.js$/i, "$1.js");
    realModulePath = resolveRealPath(sharedFilename);
    if (realModulePath) {
        onResolveFilenameFinished();
        return;
    }

    callback(new Error("(alamid) Cannot create bundle: You're trying to include the server-only module '" + modulePath + "'"));
}

/**
 * This object gets passed to fs.realpathSync to speed up path lookUps.
 * @see http://nodejs.org/docs/latest/api/fs.html#fs_fs_realpath_path_cache_callback
 *
 * Reset it before every new bundling process to avoid caching problems.
 *
 * @type {Object}
 */
resolveFilename.statCache = {};

/**
 * Tries to resolve the real path for a filename (e.g. removing symlinks).
 * Returns null if the realpathSync fails.
 *
 * @param {!String} filename
 * @return {String|null}
 */
function resolveRealPath(filename) {
    try {
        return fs.realpathSync(filename, resolveFilename.statCache);
    } catch (err) {
        return null;    // the path doesn't exist
    }
}

module.exports = resolveFilename;