"use strict";

var alamid = require("alamid"),
    Model = alamid.Model;

var <%= name %>Model = Model.define("<%= name %>Model", {

    $url: "<%= name %>"

});

module.exports = <%= name %>Model;