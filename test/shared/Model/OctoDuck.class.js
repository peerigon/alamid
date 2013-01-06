"use strict";

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

var OctoDuck = Model.extend("OctoDuck", {
    url: "octoduck",
    constructor: function(id) {
        this._super(id);
        this.setSchema(schema, "shared");
        this.setSchema(serverSchema);
        this.setService(mockedService);
    }
});

module.exports = OctoDuck;