"use strict";

var _ = require("underscore");

function doRequire(collection) {
    _.each(collection, function(filePath, identifier) {
        collection[identifier] = require(filePath);
    });
    return collection;
}

module.exports = doRequire;