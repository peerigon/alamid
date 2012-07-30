"use strict";

var schemas = require("../../../shared/registries/schemaRegistry.js");

/**
 * remove all data-fields that are not part of the shared schema
 * @param req
 * @param res
 * @param next
 */
function sanitizeData(req, res, next) {

    var data = req.getData(),
        sharedSchema = schemas.getSchema(req.getPath(), "shared"),
        field;

    if(sharedSchema === null || sharedSchema === undefined) {
        next(new Error("Invalid model '" + req.getPath() + "', No shared-schema defined!"));
        return;
    }

    //strip all fields that are not part of the shared schema
    for(field in data) {
        if(data.hasOwnProperty(field)) {
            if(sharedSchema[field] === undefined) {
                delete data[field];
            }
        }
    }
    next();
}

module.exports = sanitizeData;