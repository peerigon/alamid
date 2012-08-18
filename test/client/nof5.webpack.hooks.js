"use strict";

var resolveFilename = require("../../lib/core/bundle/resolveFilename.js"),
    nodeclassLoader = require("nodeclass").bundlers.webpack,
    path = require("path");

exports.use = function () {

    return {
        context: path.resolve(__dirname, "../../"),
        includeFilenames: true,
        debug: true,
        extensions: ["", ".client.js", ".js"],
        resolve: {
            loaders: [
                nodeclassLoader,
                { test: /\.html$/i, loader: "raw" }
            ],
            postprocess: {
                normal: [resolveFilename]
            }
        }
    };

};