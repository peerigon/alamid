"use strict";

var connect = require("connect"),
    config = require("../../../../shared/config.js"),
    paths = config.paths,
    env = require("../../../../shared/env.js");

function getStaticFileHandler() {

    //cache for 2 hours
    var maxAge = 2 * 60 * 60 * 1000,
        connectStatic = null;

    //no cache in dev
    if(env.isDevelopment()) {
        maxAge = 0;
    }

    connectStatic = connect.static(
        paths.bundle,
        {maxAge: maxAge}   // cache for 2 hours
    );

    return connectStatic;
}

module.exports = getStaticFileHandler();