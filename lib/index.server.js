"use strict";

var schema = require("alamid-schema");
schema.use(require("alamid-schema/plugins/validation"));

module.exports = function (exports) {
    exports.server = require("./server/server");
    exports.Schema = schema;
    exports.Bundler = require("./core/bundle/Bundler.class.js");
    exports.middleware = require("./server/middleware")
};
