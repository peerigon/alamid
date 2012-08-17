"use strict"; // run code in ES5 strict mode

var fs = require("fs"),
    pathHelpers = require("../../shared/helpers/pathHelpers.js");

//TODO resolve filename for alamid requires with check for path /node_modules/alamid/

/**
 * Converts requires and looks for .client replacements if .server files were requested
 * Function returns an error if .server file is required and no replacement exists
 *
 * logger.js -> logger.js (shared)
 * logger.server.js -> logger.client.js
 * myClass.server.class.js -> myClass.client.class.js
 *
 * @param {!String} filename
 * @param {!function} callback
 */
function resolveFilename(filename, callback) {
    var clientFilename,
        sharedFilename;

    if (/\.server(\.class)?\.js$/i.test(filename) === false) {
        callback(null, filename);
        return;
    }

    filename = filename.replace(/^.*!/, "");
    clientFilename = filename.replace(/\.server(\.class)?\.js$/i, ".client$1.js");

    if (fs.existsSync(clientFilename)) {
        callback(null, clientFilename);
        return;
    }

    sharedFilename = filename.replace(/\.server(\.class)?\.js$/i, "$1.js");
    if (fs.existsSync(sharedFilename)) {
        callback(null, sharedFilename);
        return;
    }

    callback(new Error("(alamid) Cannot create bundle: You're trying to include the server-only module '" + filename + "'"));
}

module.exports = resolveFilename;