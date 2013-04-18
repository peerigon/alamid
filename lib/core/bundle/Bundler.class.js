"use strict";

var Base = require("../../shared/Base.class.js");

var runCreateBundle = require("./runCreateBundle.js");

var Bundler = Base.extend("Bundler", {
    create : function(config, callback) {
        runCreateBundle(config, callback);
    }
});

module.exports = Bundler;