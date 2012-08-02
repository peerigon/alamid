"use strict";

var Class = require("nodeclass").Class;
var Model = require('../../../lib/shared/Model.class.js'),
    schema = require("./schemas/OctocatSchema.js"),
    serverSchema = require("./schemas/OctocatSchema.server.js");

var mockedService = {
    read : function(model, callback) {
        callback({ status : "success", data : model.get() });
    },
    create : function(model, callback) {
        callback({ status : "success", data : { name : "serverDuck", id : 2 }});
    }
};


var OctoDuck = new Class({
    Extends : Model,
    $url : "octoduck",
    "init": function(id) {
        this.Super(id);
        this.Super.setSchema(schema, "shared");
        this.Super.setSchema(serverSchema);
        this.Super.setService(mockedService);
    }
});

module.exports = OctoDuck;