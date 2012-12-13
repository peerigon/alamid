"use strict";

function errorPasser(req, res, next) {
    next(new Error("Error passed by errorPasser"));
}

module.exports = errorPasser;