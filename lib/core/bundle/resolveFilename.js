"use strict"; // run code in ES5 strict mode

var fs = require("fs");

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
 * @param {String} filename
 * @param {Function} callback
 * @return {String|undefined}
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

    if (/^\?/.test(modulePath)) {
        return onResolveFilenameFinished();
    }

    realModulePath = resolveRealPath(modulePath);

    if (realModulePath === null) {
        callback(new Error("(alamid) Cannot find module '" + modulePath + "'"));
        return undefined;
    }

    //ALAMID MODULES
    //SERVER
    if(/alamid[\/\\]lib[\/\\]server/i.test(realModulePath) && /\.server(\.class)?\.js$/i.test(realModulePath) === true) {

        realModulePath = realModulePath.replace(/alamid\/lib\/server/i, "alamid/lib/client");
        realModulePath = realModulePath.replace(/alamid\\lib\\server/i, "alamid\\lib\\client");
        realModulePath = realModulePath.replace(/\.server/, ".client");

        realModulePath = resolveRealPath(realModulePath);

        if (realModulePath) {
            onResolveFilenameFinished();
        } else {
            callback(new Error("(alamid) Cannot create bundle: You're trying to include the server-only module '" + modulePath + "'"));
        }
        return undefined;
    }

    //CORE
    if(/alamid[\/\\]lib[\/\\]core/i.test(realModulePath) && /\.server(\.class)?\.js$/i.test(realModulePath) === true) {

        realModulePath = realModulePath.replace(/alamid\/lib\/core/i, "alamid/lib/client");
        realModulePath = realModulePath.replace(/alamid\\lib\\core/i, "alamid\\lib\\client");
        realModulePath = realModulePath.replace(/\.server/, ".client");

        realModulePath = resolveRealPath(realModulePath);

        if (realModulePath) {
            onResolveFilenameFinished();
        } else {
            callback(new Error("(alamid) Cannot create bundle: You're trying to include the server-only module '" + modulePath + "'"));
        }
        return undefined;
    }

    //NON ALAMID modules
    if (/\.server(\.class)?\.js$/i.test(realModulePath) === false) {
        onResolveFilenameFinished();
        return undefined;
    }

    clientFilename = modulePath.replace(/\.server(\.class)?\.js$/i, ".client$1.js");
    realModulePath = resolveRealPath(clientFilename);
    if (realModulePath) {
        onResolveFilenameFinished();
        return undefined;
    }

    sharedFilename = modulePath.replace(/\.server(\.class)?\.js$/i, "$1.js");
    realModulePath = resolveRealPath(sharedFilename);
    if (realModulePath) {
        onResolveFilenameFinished();
        return undefined;
    }

    callback(new Error("(alamid) Cannot create bundle: You're trying to include the server-only module '" + modulePath + "'"));
}

/**
 * This object gets passed to fs.realpathSync to speed up path look-ups.
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
 * @param {String} filename
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