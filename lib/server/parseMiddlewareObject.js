"use strict";
var _ = require("underscore");

/**
 * Parse a middleware-key like "read, destroy /blogPost/comments
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
            "destroy"
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
    reqPath = keyParts[1].toLowerCase();

    return {
        "methods" : methods,
        "reqPath" : reqPath
    };
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


/**
 * Parses middlewareDefinitionObject and returns an object for middleware-use
 * @param {!Object} middlewareObj
 * @return {!Object} resObj
 */
function parseMiddlewareObject(definedRoutes, middlewareObj) {

    var resObj = {},
        pathsObj = {},
        reqPaths = [],
        keyParts,
        globalMethodMiddleware = {
            "create" : [],
            "read" : [],
            "update" : [],
            "destroy" : []
        };

    //populate objects
    _(middlewareObj).each(function(middlewareFunctions, mwKey) {

        keyParts = parseKey(mwKey);

        //check for wildcard paths
        if(keyParts.reqPath === "*" || keyParts.reqPath === "") {
            //push those methods to the global methodMiddlewareArray
            //TODO include global request routes and fix test
            resObj["/"] = addMiddlewareFunctions(globalMethodMiddleware, keyParts.methods, middlewareFunctions);
        }
        else {
            //we don't want overwrites
            if(pathsObj[keyParts.reqPath] === undefined) {
                //all paths with methods as src
                pathsObj[keyParts.reqPath] = {
                    "create" : [],
                    "read" : [],
                    "update" : [],
                    "destroy" : []
                };

                //all paths with methods which will be filled
                resObj[keyParts.reqPath] = {
                    "create" : [],
                    "read" : [],
                    "update" : [],
                    "destroy" : []
                };
            }

            //add methods to the src-obj
            pathsObj[keyParts.reqPath] = addMiddlewareFunctions(pathsObj[keyParts.reqPath], keyParts.methods, middlewareFunctions);
            //fill the array with all paths; we will sort it in the next step and iterate
            reqPaths.push(keyParts.reqPath);
        }
    });

    //add all defined routes to reqPaths
    if(Array.isArray(definedRoutes) && definedRoutes.length > 1) {

        //add given routes a middleware-store
        //we might merge it with the init process abvove later
        _(definedRoutes).each(function(value, num) {
            //don't overwrite if existent, because we might have functions then
            if(pathsObj[value] === undefined) {
                pathsObj[value] = {
                    "create" : [],
                    "read" : [],
                    "update" : [],
                    "destroy" : []
                };
                resObj[value] = {
                    "create" : [],
                    "read" : [],
                    "update" : [],
                    "destroy" : []
                };
            }
        });

        reqPaths = _(reqPaths).union(definedRoutes);
    }

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


module.exports = parseMiddlewareObject;