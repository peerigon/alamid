"use strict";

var schemas = {};

function setSchemas(schemasObject) {
    if(schemasObject !== undefined && schemasObject !== null) {
        schemas = schemasObject;
    }
}

function setSchema(schemaName, schemaDefinition) {
    if(schemaName !== undefined && schemaDefinition !== undefined) {
        schemas[schemaName] = schemaDefinition;
    }
}

/**
 * get the schema for the given path
 * @param {String} schemaName
 * @param {String} type (server/shared/client)
 * @return {Function}
 */
function getSchema(schemaName, type) {

    //we only want to load schemas of a certain type
    if(type !== undefined) {
        if(schemas[type] !== undefined) {
            schemas = schemas[type];
        }
    }

    //only expose server files and existing paths
    if(schemas[schemaName] !== undefined) {
        return schemas[schemaName];
    }
    return null;
}

exports.schemas = schemas;
exports.getSchema = getSchema;
exports.setSchema = setSchema;
exports.setSchemas = setSchemas;