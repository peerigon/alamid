"use strict";

var Class = require("alamid-class"),
    resolveFilename = require("./resolveFilename.js");

var AlamidWebpackPlugin = new Class("AlamidWebpackPlugin", {

    apply: function (compiler) {
        compiler.plugin("normal-module-factory", function (nmf) {
            nmf.plugin("after-resolve", function (result, callback) {
                var oldResource = result.resource,
                    newResource = resolveFilename(oldResource);

                result.request = result.request.slice(0, -oldResource.length) + newResource;
                result.userRequest = result.userRequest.slice(0, -oldResource.length) + newResource;
                result.resource = newResource;

                return callback(null, result);
            });
        });
    }
});

module.exports = AlamidWebpackPlugin;