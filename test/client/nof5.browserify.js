"use strict";

var nodeclass = require("nodeclass"),
    browserifyBypass = require("browserify-bypass"),
    rewire = require("rewire");

exports.use = function useHook() {

    return [
        browserifyBypass,
        nodeclass.bundlers.browserify,
        rewire.browserify
    ];

};