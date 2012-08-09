"use strict";

var Class = require("nodeclass").Class;
var Model = require('../../../lib/shared/Model.class.js');

var schema = {
    name: {
        type : String,
        default : "John Wayne"
    },
    age: {
        type : Number,
        default : 45
    },
    kills: Number
};

var User1 = Model.define({
    $url : "User1",
    init: function(id) {
        this.Super(id);
        this.Super.setSchema(schema);
    },
    getService: function() {
        return null;
    },
    "getValidator": function() {
        return null;
    },
    "accept": function() {
        this.Super.acceptCurrentState();
    }
});

module.exports = User1;