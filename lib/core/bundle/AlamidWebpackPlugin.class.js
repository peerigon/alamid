"use strict";

var Class = require("alamid-class"),
    env = require("../../shared/env.js"),
    fs = require("fs");

var AlamidWebpackPlugin = new Class("AlamidWebpackPlugin", {

    _statCache: null,

    apply: function (compiler) {
        var self = this;

        compiler.plugin("compile", function () {
            self._statCache = {};
        });
        compiler.plugin("normal-module-factory", function (nmf) {
            nmf.plugin("after-resolve", function (result, callback) {
                var oldResource = result.resource,
                    newResource = self.resolveFilename(oldResource);

                result.request = result.request.slice(0, -oldResource.length) + newResource;
                result.userRequest = result.userRequest.slice(0, -oldResource.length) + newResource;
                result.resource = newResource;

                return callback(null, result);
            });
        });
    },

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
     * @return {String|undefined}
     */
    resolveFilename: function (filename) {
        var originalFilename = filename,
            clientFilename,
            sharedFilename;

        //ALAMID MODULES
        //SERVER
        if (/alamid[\/\\]lib[\/\\]server/i.test(filename) && /\.server(\.class)?\.js$/i.test(filename) === true) {

            filename = filename.replace(/alamid\/lib\/server/i, "alamid/lib/client");
            filename = filename.replace(/alamid\\lib\\server/i, "alamid\\lib\\client");
            filename = filename.replace(/\.server/, ".client");

            if (fs.existsSync(filename)) {
                return filename;
            } else {
                throw new Error("(alamid) Cannot create bundle: You're trying to include the server-only module '" + originalFilename + "'");
            }
        }

        //CORE
        if (/alamid[\/\\]lib[\/\\]core/i.test(filename) && /\.server(\.class)?\.js$/i.test(filename) === true) {

            filename = filename.replace(/alamid\/lib\/core/i, "alamid/lib/client");
            filename = filename.replace(/alamid\\lib\\core/i, "alamid\\lib\\client");
            filename = filename.replace(/\.server/, ".client");

            if (fs.existsSync(filename)) {
                return filename;
            } else {
                throw new Error("(alamid) Cannot create bundle: You're trying to include the server-only module '" + originalFilename + "'");
            }
        }

        //NON ALAMID modules
        if (/\.server(\.class)?\.js$/i.test(filename) === false) {
            return filename;
        }

        clientFilename = filename.replace(/\.server(\.class)?\.js$/i, ".client$1.js");
        if (fs.existsSync(clientFilename)) {
            return clientFilename;
        }

        sharedFilename = filename.replace(/\.server(\.class)?\.js$/i, "$1.js");
        if (fs.existsSync(sharedFilename)) {
            return sharedFilename;
        }

        throw new Error("(alamid) Cannot create bundle: You're trying to include the server-only module '" + originalFilename + "'");
    }
});

module.exports = AlamidWebpackPlugin;