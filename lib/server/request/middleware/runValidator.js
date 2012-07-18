"use strict";

var paths = require('../../../shared/helpers/pathHelpers.js'),
    config = require('../../../core/config'),
    models = require("../../../shared/models.js");

function runValidator(req, res, next) {

    /**
     * ON SERVER
     * next steps:
     * - check if model.class.js exists and instantiate
     * -- if not: instantiate of model.class (the shared model)
     * - call model.validate and pass callback back!
     *
     * ON CLIENT
     * next steps:
     * - the same as above but with model.client.js ;)
     */

    var path = req.getPath();

    res.setStatusCode(404);
    next(new Error("No validator found for: " + path));
}

module.exports = runValidator;
