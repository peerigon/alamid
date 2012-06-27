"use strict";

var connect = require("connect"),
    config = require("../../../../core/config"),
    paths = config.paths;

function getStaticFileHandler() {

    //cache for 2 hours
    var maxAge = 2 * 60 * 60 * 1000,
        connectStatic = null;

    //no cache in dev
    if(config.isDev) {
        maxAge = 0;
    }

    connectStatic = connect.static(
        paths.bundle,
        {maxAge: maxAge}   // cache for 2 hours
    );

    return connectStatic;
}

module.exports = getStaticFileHandler();