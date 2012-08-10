"use strict";

var _ = require("underscore");

/**
 * extends the shared schema with the env-specific schema
 * overwrites methods that are defined env-specific
 * @param {Object} schemas
 */
function extendSchemas(schemas) {

    function extendSchema(sharedSchema, envSchema) {
        if(sharedSchema === undefined) {
            throw new Error("(alamid) No shared Schema defined for '" + path + "'");
        }
        return _(sharedSchema).extend(envSchema);
    }

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
}

module.exports = extendSchemas;