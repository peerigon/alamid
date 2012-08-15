"use strict"; // run code in ES5 strict mode

var fs = require("fs"),
    pathHelpers = require("../../shared/helpers/pathHelpers.js");

function resolveFilename(filename, callback) {
    var clientFilename,
        sharedFilename;

    console.log("\n", filename);
    if (/\.server(\.class)?\.js$/i.test(filename) === false) {
        console.log(filename);
        callback(null, filename);
        return;
    }

    filename = filename.replace(/^.*!/, "");
    clientFilename = filename.replace(/\.server(\.class)?\.js$/i, ".client$1.js");

    if (fs.existsSync(clientFilename)) {
        console.log(clientFilename);
        callback(null, clientFilename);
        return;
    }

    sharedFilename = filename.replace(/\.server(\.class)?\.js$/i, "$1.js");
    if (fs.existsSync(sharedFilename)) {
        console.log(sharedFilename);
        callback(null, sharedFilename);
        return;
    }

    throw new Error("(alamid) Cannot create bundle: You're trying to include the server-only module '" + filename + "'");
}

module.exports = resolveFilename;