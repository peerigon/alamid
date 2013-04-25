"use strict";

var Base = require("../../shared/Base.class.js");

var bundle = require("./bundle.js");

var Bundler = Base.extend("Bundler", {
    create : bundle.createBundle
});

module.exports = Bundler;