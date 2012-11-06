"use strict";

var Class = require("nodeclass").Class,
    EventEmitter = require("../../shared/EventEmitter.class.js");

var runCreateBundle = require("./runCreateBundle.js");

var Bundler = new Class("Bundler", {
    Extends : EventEmitter,
    init : function() {

    },
    create : function(config, callback) {
        runCreateBundle(config, callback);
    }
});

module.exports = Bundler;