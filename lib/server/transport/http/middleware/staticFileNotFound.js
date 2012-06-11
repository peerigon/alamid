"use strict";

function staticFileNotFound(req, res, next) {
    console.log("not found");
    res.end("Not found");
}

module.exports = staticFileNotFound;