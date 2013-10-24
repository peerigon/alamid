"use strict";

var Model = require('../../../lib/shared/Model.class.js'),
    sharedSchema = require("./schemas/OctocatSchema.js"),
    serverSchema = require("./schemas/OctocatSchema.server.js");

var Octocat = Model.extend("Octocat", {
    url: "Octocat",
    constructor: function(id) {
        this._super(id);
        this.setSchema(sharedSchema, "shared");
        this.setSchema(serverSchema, "local");
    }
});

module.exports = Octocat;