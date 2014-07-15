"use strict";

var Model = require('../../../lib/shared/Model.class.js'),
    sharedSchema = require("./schemas/OctocatSchema.js"),
    serverSchema = require("./schemas/OctocatSchema.server.js");

var Octocat = Model.extend("Octocat", {
    url: "Octocat",
    _localSchema: serverSchema,
    _sharedSchema: sharedSchema,
    constructor: function(id) {
        this._super(id);
    }
});

module.exports = Octocat;