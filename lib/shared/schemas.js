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
 * @return {Function}
 */
function getSchema(schemaName) {

    //only expose server files and existing paths
    if(schemas[schemaName] !== undefined) {
        return schemas[schemaName];
    }
    return null;
}

exports.models = schemas;
exports.getSchema = getSchema;
exports.setSchema = setSchema;
exports.setSchemas = setSchemas;