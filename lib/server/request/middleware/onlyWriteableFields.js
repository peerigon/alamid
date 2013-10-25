"use strict";

var schemas = require("../../../shared/registries/schemaRegistry.js"),
    getWriteableFields = require("../../../shared/helpers/schema.js").getWriteableFields;

/**
 * checks if data contains fails that are not writeable
 * return an array of invalidFields
 * array.length = 0 means everything is easy!
 * @param data
 * @param writeableFields
 * @returns {Array}
 */
function findInvalidFields(data, writeableFields) {

    var invalidFields = [];

    for (var field in data) {
        if (data.hasOwnProperty(field)) {
            if (writeableFields.indexOf(field) === -1) {
                invalidFields.push(field);
                delete data[field];
            }
        }
    }

    return invalidFields;
}

/**
 * checks req.data for fields that are flagged as not writeable
 * in shared schema. Ends the request in case of a invalid field
 *
 * @param req
 * @param res
 * @param next
 */
function onlyWriteableFields(req, res, next) {

    var schema = schemas.getSchema(req.getPath(), "shared") || {},
        writeableFields = getWriteableFields(schema),
        invalidFields = findInvalidFields(req.data, writeableFields);

    if (invalidFields.length > 0) {

        res.end({
            status : "fail",
            message : "Invalid fields: '" + invalidFields.join(",") + "'",
            data : {
                errorCode : "badRequest",
                invalidFields : invalidFields
            }
        });
        return;
    }
    next();
}

module.exports = onlyWriteableFields;