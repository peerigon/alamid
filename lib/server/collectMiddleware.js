"use strict";

var path = require("path"),
    _ = require("underscore"),
    util = require("util");

var config = require("../shared/config");

function collectMiddleware(middlewarePath, callback) {

    var middlewareDefinitions,
        middleware = {};


    if(!path.exists(middlewarePath)) {
        callback(null, {});
        return;
    }

    middlewareDefinitions = require(middlewarePath);

}

/**
 * Parse a middleware-key like "read, delete /blogPost/comments
 * Returns an object containing methods and reqPath
 * @param {!String} key
 * @return {Object}
 */
function parseKey(key) {

    var methods = [];
    var reqPath;

    //CHECK METHOD
    var keyParts = key.split(" /");

    //look for wildcard
    if(keyParts[0] === "*") {
        methods = [
            "create",
            "read",
            "update",
            "delete"
        ];
    }
    else {
        if(keyParts[0].split(" ").length > 1) {
            methods = keyParts[0].split(" ");
        }
        else {
            methods = [keyParts[0]];
        }
    }

    //PATH
    reqPath = keyParts[1];

    return {
        "methods" : methods,
        "reqPath" : reqPath
    };
}

/**
 * Parses middlewareDefinitionObject and returns an object for middleware-use
 * @param {!Object} middlewareObj
 * @return {!Object} resObj
 */
function middlewareDefinitionToObject(middlewareObj) {

    var resObj = {};
    var pathsObj = {};
    var reqPaths = [];
    var keyParts;

    //populate objects
    _(middlewareObj).each(function(middlewareFunctions, mwKey) {

        keyParts = parseKey(mwKey);

        if(pathsObj[keyParts.reqPath] === undefined) {

            //all paths with methods as src
            pathsObj[keyParts.reqPath] = {
                "create" : [],
                "read" : [],
                "update" : [],
                "delete" : []
            };

            //all paths with methods which will be filled
            resObj[keyParts.reqPath] = {
                "create" : [],
                "read" : [],
                "update" : [],
                "delete" : []
            };
        }

        //add methods to the src-obj
        pathsObj[keyParts.reqPath] = addMiddlewareFunctions(pathsObj[keyParts.reqPath], keyParts.methods, middlewareFunctions);

        //fill the array with all paths; we will sort it in the next step and interate
        reqPaths.push(keyParts.reqPath);
    });

    //we need the reqPaths in order for extending existing paths
    reqPaths.sort();

    var activePath;

    //SETTING & EXTENDING
    _(reqPaths).each(function(reqPath, idx) {

        if(activePath === undefined || reqPath.indexOf(activePath) !== 0) {
            activePath = reqPath;
        }

        //just set
        if(activePath === reqPath) {
            resObj[reqPath] = pathsObj[reqPath];
        }
        //extending
        else {
            //always adopt the methods of the path above!
            resObj[reqPath] = extendMiddlewareFunctions(pathsObj[reqPath], pathsObj[reqPaths[idx-1]]);
        }
    });

    return resObj;
}

/**
 * extend pathObj with all methods of pathObjToExtendWith
 * @param {!Object} pathObj
 * @param {!Object}pathObjToExtendWith
 * @return {!Object} pathObj
 */
function extendMiddlewareFunctions(pathObj, pathObjToExtendWith) {

    _(pathObj).each(function(key, reqPathMethod) {
        pathObj[reqPathMethod] = pathObjToExtendWith[reqPathMethod].concat(pathObj[reqPathMethod]);
    });

    return pathObj;
}

/**
 * add functions to a middleware-path-object
 * @param {!Object} reqPathObj
 * @param {!Array} methods
 * @param {!Array} middlewareFunctions
 * @return {!Object} reqPathObj
 */
function addMiddlewareFunctions(reqPathObj, methods, middlewareFunctions) {

    if(_(middlewareFunctions).isFunction) {
        middlewareFunctions = [middlewareFunctions];
    }

    for(var i = 0; i < methods.length; i++) {
        reqPathObj[methods[i]] = _.flatten(middlewareFunctions.concat(reqPathObj[methods[i]]));
    }
    return reqPathObj;
}


exports.middlewareDefintionToObject = middlewareDefinitionToObject;
