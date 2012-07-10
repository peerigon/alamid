"use strict";

var nodeclass = require("nodeclass"),
    browserifyBypass = require("browserify-bypass");

exports.use = function useHook() {

    console.log("using 'nodeclass.browser.browserify' for browserify");

    return [
        browserifyBypass,
        nodeclass.browser.browserify
    ];
};