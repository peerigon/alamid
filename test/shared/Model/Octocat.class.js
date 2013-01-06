"use strict";

var Model = require('../../../lib/shared/Model.class.js'),
    schema = require("./schemas/OctocatSchema.js"),
    serverSchema = require("./schemas/OctocatSchema.server.js");

var Octocat = Model.extend("Octocat", {
    url: "Octocat",
    constructor: function(id) {
        this._super(id);
        this.setSchema(schema, "shared");
        this.setSchema(serverSchema);
    },
    accept: function() {
        this.acceptCurrentState();
    }
});

module.exports = Octocat;