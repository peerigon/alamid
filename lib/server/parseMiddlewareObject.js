"use strict";
var _ = require("underscore");

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

    //validate split was ok!
    if(keyParts.length !== 2){
        throw new Error("Middleware parsing failed: Invalid object-key " + key);
    }

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
function parseMiddlewareObject(middlewareObj) {

    var resObj = {},
        pathsObj = {},
        reqPaths = [],
        keyParts,
        globalMethodMiddleware = {
            "create" : [],
            "read" : [],
            "update" : [],
            "delete" : []
        };

    //populate objects
    _(middlewareObj).each(function(middlewareFunctions, mwKey) {

        keyParts = parseKey(mwKey);

        //check for wildcard paths
        if(keyParts.reqPath === "*" || keyParts.reqPath === "") {
            //push those methods to the global methodMiddlewareArray
            addMiddlewareFunctions(globalMethodMiddleware, keyParts.methods, middlewareFunctions);
        }
        else {
            //we don't want overwrites
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
            //fill the array with all paths; we will sort it in the next step and iterate
            reqPaths.push(keyParts.reqPath);
        }
    });

    //we need the reqPaths in order for extending existing paths
    reqPaths.sort();

    var activePath;

    //SETTING & EXTENDING
    _(reqPaths).each(function(reqPath, idx) {

        //we've found a new activePath! yeeeha!
        if(activePath === undefined || reqPath.indexOf(activePath) !== 0) {
            activePath = reqPath;
        }

        //just set
        if(activePath === reqPath) {
            //merge methods for active path with global middleware!
            resObj[reqPath] = extendMiddlewareFunctions(pathsObj[reqPath], globalMethodMiddleware);
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
    //if input was no array, convert it to single-function array
    if(_(middlewareFunctions).isFunction) {
        middlewareFunctions = [middlewareFunctions];
    }
    //push function for all methods
    for(var i = 0; i < methods.length; i++) {
        reqPathObj[methods[i]] = _.flatten(middlewareFunctions.concat(reqPathObj[methods[i]]));
    }
    return reqPathObj;
}

module.exports = parseMiddlewareObject;