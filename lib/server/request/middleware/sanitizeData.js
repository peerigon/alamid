"use strict";

var schemas = require("../../../shared/registries/schemaRegistry.js");

/**
 * remove all data-fields that are not part of the shared schema
 * @param req
 * @param res
 * @param next
 */
function sanitizeData(req, res, next) {

    var method = req.getMethod(),
        data = req.data,
        sharedSchema = schemas.getSchema(req.getPath(), "shared"),
        field;

    //no sanitizing for read and delete
    if (method === "read" || method === "destroy") {
        next();
        return;
    }

    if (sharedSchema === null || sharedSchema === undefined) {
        //skip if there is no schema
        next();
        return;
    }

    //strip all fields that are not part of the shared schema
    for (field in data) {
        if (data.hasOwnProperty(field)) {
            if (sharedSchema[field] === undefined && field !== "id") {
                delete data[field];
            }
        }
    }
    next();
}

module.exports = sanitizeData;