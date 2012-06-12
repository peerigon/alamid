"use strict";

function staticFileNotFound(req, res, next) {
    res.end("Not found.");
}

module.exports = staticFileNotFound;