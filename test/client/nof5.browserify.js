"use strict";

var nodeclass = require("nodeclass"),
    browserifyBypass = require("browserify-bypass");

exports.use = function useHook() {

    return [
        browserifyBypass,
        nodeclass.bundlers.browserify
    ];

};