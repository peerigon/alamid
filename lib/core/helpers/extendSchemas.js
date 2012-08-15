"use strict";

var _ = require("underscore");

/**
 * extends a shared schema with the env-specific schema
 * overwrites methods that are defined env-specific
 * @param sharedSchema
 * @param envSchema
 * @return {*}
 */
function extendSchema(sharedSchema, envSchema) {
    if(sharedSchema === undefined) {
        throw new Error("(alamid) No shared Schema defined for '" + path + "'");
    }
    return _(sharedSchema).extend(envSchema);
}

/**
 * extends the shared schemas with the env-specific schemas
 * overwrites methods that are defined env-specific
 * @param {Object} schemas
 */
function extendSchemas(schemas) {

    var path;

    //extend server-schemas
    for(path in schemas.server) {
        if(schemas.server.hasOwnProperty(path)){
            //using clone here to keep original shared schema untouched
            schemas.server[path] = extendSchema(_.clone(schemas.shared[path]), schemas.server[path]);
        }
    }

    //extend client-schemas
    for(path in schemas.client) {
        if(schemas.client.hasOwnProperty(path)){
            //using clone here to keep original shared schema untouched
            schemas.client[path] = extendSchema(_.clone(schemas.shared[path]), schemas.client[path]);
        }
    }

    return schemas;
}

exports.extendSchema = extendSchema;
exports.extendSchemas = extendSchemas;
