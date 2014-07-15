"use strict";
var environment = require("../env.js");

var schemas = {};

function setSchemas(schemasObject) {
    if(schemasObject !== undefined && schemasObject !== null) {
        schemas = schemasObject;
    }
}

function setSchema(schemaName, schemaDefinition, schemaType) {
    if(schemaType !== undefined) {
        if(schemas[schemaType] !== undefined) {
            schemas = schemas[schemaType];
        }
    }
    if(schemaName !== undefined && schemaDefinition !== undefined) {
        schemas[schemaName] = schemaDefinition;
    }
}

/**
 * get the schema for the given path
 * @param {String} schemaName
 * @param {String=} type (server/shared/client)
 * @return {Function}
 */
function getSchema(schemaName, type) {

    //we only want to load schemas of a certain type
    if(type !== undefined) {
        if(schemas[type] !== undefined) {
            //schemas = schemas[type];
            return schemas[type][schemaName] || null;
        }
    }
    else {
        if(environment.isClient() && schemas.client !== undefined) {
            return schemas.client[schemaName];
        }
        else if(environment.isServer() && schemas.server !== undefined){
            return schemas.server[schemaName];
        }
    }

    return null;
}

exports.schemas = schemas;
exports.getSchema = getSchema;
exports.setSchema = setSchema;
exports.setSchemas = setSchemas;