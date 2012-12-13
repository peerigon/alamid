"use strict";

function errorThrower(req, res, next) {
    throw new Error("Error thrown by errorThrower");
}

module.exports = errorThrower;