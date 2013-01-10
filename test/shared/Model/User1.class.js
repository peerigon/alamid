"use strict";

var Model = require('../../../lib/shared/Model.class.js');

var schema = {
    name: {
        type : String,
        "default": "John Wayne"
    },
    age: {
        type : Number,
        "default": 45
    },
    kills: Number
};

var User1 = Model.extend("User1", {
    url : "User1",
    constructor: function(id) {
        this._super(id);
        this.setSchema(schema);
    },
    getService: function() {
        return null;
    },
    getValidator: function() {
        return null;
    }
});

module.exports = User1;