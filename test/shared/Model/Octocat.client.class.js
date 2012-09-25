"use strict";

var Class = require("nodeclass").Class;
var Model = require('../../../lib/shared/Model.class.js'),
    schema = require("./schemas/OctocatSchema.js");

var Octocat = Model.define("Octocat", {
    $url : "Octocat",
    "init": function(id) {
        this.Super(id);
        this.Super.setSchema(schema, "shared");
        this.Super.setSchema(schema);
    }
});


module.exports = Octocat;