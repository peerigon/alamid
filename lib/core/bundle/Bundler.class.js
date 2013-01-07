"use strict";

var EventEmitter = require("../../shared/EventEmitter.class.js");

var runCreateBundle = require("./runCreateBundle.js");

var Bundler = EventEmitter.extend("Bundler", {
    create : function(config, callback) {
        runCreateBundle(config, callback);
    }
});

module.exports = Bundler;