"use strict";

var schemas = require("../../../shared/registries/schemaRegistry.js"),
    getUnwriteableFieldsForData = require("../../../shared/helpers/schema.js").getUnwriteableFieldsForData;

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
        invalidFields = getUnwriteableFieldsForData(schema, req.data);

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