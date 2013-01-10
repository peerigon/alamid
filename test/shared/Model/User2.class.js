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
    birthday : Date,
    tags: []
};

var User2 = Model.extend("User2", {
    url : "User2",
    constructor: function(id) {
        this._super(id);
        this.setSchema(schema);
    }
});

module.exports = User2;