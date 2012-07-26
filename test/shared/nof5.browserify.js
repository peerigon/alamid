"use strict";

var nodeclass = require("nodeclass"),
    browserifyBypass = require("browserify-bypass"),
    browserify = require("browserify"),
    rewire = require("rewire");

exports.use = function useHook() {

    return [
        browserifyBypass,
        nodeclass.bundlers.browserify,
        rewire.browserify
    ];

};