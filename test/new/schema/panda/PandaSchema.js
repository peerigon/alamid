"use strict";

var alamid = require("../../../../lib/index");

new alamid.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number
    }
});