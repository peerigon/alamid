"use strict";

var fs = require("fs");

var serverModule = /\.server(\.class)?\.js$/i,
    alamidServerModule = /alamid([\/\\])lib[\/\\]server[\/\\](.+?)\.server\.js$/i,
    alamidCoreModule = /alamid([\/\\])lib[\/\\]core[\/\\](.+?)\.server\.js$/i;

/**
 * Resolves module paths.
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
 * @return {String|undefined}
 */
function resolveFilename(filename) {
    var originalFilename = filename;

    //NON ALAMID modules
    if (serverModule.test(filename) === false) {
        return filename;
    }

    //ALAMID MODULES
    //SERVER
    if (alamidServerModule.test(filename)) {

        filename = filename.replace(alamidServerModule, "alamid$1lib$1client$1$2.client.js");
        if (fs.existsSync(filename)) {
            return filename;
        } else {
            throw new Error("(alamid) Cannot create bundle: You're trying to include the server-only module '" + originalFilename + "'");
        }
    }

    //CORE
    if (alamidCoreModule.test(filename)) {

        filename = filename.replace(alamidCoreModule, "alamid$1lib$1client$1$2.client.js");
        if (fs.existsSync(filename)) {
            return filename;
        } else {
            throw new Error("(alamid) Cannot create bundle: You're trying to include the server-only module '" + originalFilename + "'");
        }
    }

    filename = originalFilename.replace(serverModule, ".client$1.js");
    if (fs.existsSync(filename)) {
        return filename;
    }

    filename = originalFilename.replace(serverModule, "$1.js");
    if (fs.existsSync(filename)) {
        return filename;
    }

    throw new Error("(alamid) Cannot create bundle: You're trying to include the server-only module '" + originalFilename + "'");
}

module.exports = resolveFilename;