"use strict";

var Model = require('../../../lib/shared/Model.class.js');

var schema = {
    name: {
        type : String,
        "default": "John Wayne"
    },
    loginName: {
        type: String,
        set: function (loginName) {
            return loginName.replace(/^\s+|\s+$/g, "");
        }
    },
    email: {
        type: String,
        set: [
            function (email) {
                return email.trim();
            },
            function (email) {
                return email.toLowerCase();
            }
        ]
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