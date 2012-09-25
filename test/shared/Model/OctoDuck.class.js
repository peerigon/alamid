"use strict";

var Class = require("nodeclass").Class;
var Model = require('../../../lib/shared/Model.class.js'),
    schema = require("./schemas/OctocatSchema.js"),
    serverSchema = require("./schemas/OctocatSchema.server.js");

var mockedService = {
    read : function(remote, ids, callback) {
        callback({ status : "success", data : { name : "emil" } });
    },
    create : function(remote, ids, model, callback) {
        callback({ status : "success", data : { name : "serverDuck", id : 2 }});
    }
};

var OctoDuck = Model.define("OctoDuck", {
    $url : "octoduck",
    init: function(id) {
        this.Super(id);
        this.Super.setSchema(schema, "shared");
        this.Super.setSchema(serverSchema);
        this.Super.setService(mockedService);
    }
});

module.exports = OctoDuck;