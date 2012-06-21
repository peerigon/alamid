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


function parseKey(key) {

    var methods = [];
    var reqPath;

    //CHECK METHOD
    var keyParts = key.split(" /");

    if(keyParts[0].split(" ").length > 1) {
        methods = keyParts[0].split(" ");
    }
    else {
        methods = [keyParts[0]];
    }

    //PATH
    reqPath = keyParts[1];

    return {
        "methods" : methods,
        "reqPath" : reqPath
    };
}

function middlewareDefinitionToObject(middlewareObj) {

    var resObj = {};
    var pathsObj = {};
    var reqPaths = [];
    var keyParts;

    //populate objects
    _(middlewareObj).each(function(middlewareFunctions, mwKey) {

        keyParts = parseKey(mwKey);

        if(pathsObj[keyParts.reqPath] === undefined) {

            pathsObj[keyParts.reqPath] = {
                "create" : [],
                "read" : [],
                "update" : [],
                "delete" : []
            };

            resObj[keyParts.reqPath] = {
                "create" : [],
                "read" : [],
                "update" : [],
                "delete" : []
            };
        }

        pathsObj[keyParts.reqPath] = addMiddlewareFunctions(pathsObj[keyParts.reqPath], keyParts.methods, middlewareFunctions);
        reqPaths.push(keyParts.reqPath);
    });

    //fill resObj with methods
    //get the keys of the resO
    reqPaths.sort();

    console.log("reqPaths", util.inspect(reqPaths));
    console.log("resObj", util.inspect(resObj));
    console.log("pathsObj", util.inspect(pathsObj));



    var activePath;

    //SETTING & EXTENDING
    _(reqPaths).each(function(reqPath, idx) {

        console.log(idx);

        if(activePath === undefined || reqPath.indexOf(activePath) !== 0) {
            activePath = reqPath;
        }

        //just set
        if(activePath === reqPath) {
            resObj[reqPath] = pathsObj[reqPath];
        }
        //extending
        else {
            resObj[reqPath] = extendMiddlewareFunctions(pathsObj[reqPath], pathsObj[activePath]);
            //resObj[reqPath] = extendMiddlewareFunctions(pathsObj[reqPath], pathsObj[reqPaths[idx-1]]);
        }

    });

    console.log("resObj", util.inspect(resObj, false, null));
}

function extendMiddlewareFunctions(pathObj, pathObjToExtendWith) {

    console.log("extending " + util.inspect(pathObj) + " with " + util.inspect(pathObjToExtendWith));

    _(pathObj).each(function(key, reqPathMethod) {

        //console.log("reqMethod", i, reqPathMethod);

        if(pathObjToExtendWith[reqPathMethod] !== []) {
            _(pathObjToExtendWith[reqPathMethod]).each(function(mwFunction) {
                //console.log("mwFunction", mwFunction);
                pathObj[reqPathMethod].unshift(mwFunction);
            });
        }
    });

    console.log("returning: ", pathObj);
    return pathObj;
}

function addMiddlewareFunctions(reqPathObj, methods, middlewareFunctions) {

    for(var i = 0; i < methods.length; i++) {
        if(_(reqPathObj[methods[i]]).isArray()) {
            reqPathObj[methods[i]].push(middlewareFunctions);
        }
        else {
            reqPathObj[methods[i]] = middlewareFunctions;
        }
    }

    return reqPathObj;
}



exports.middlewareDefintionToObject = middlewareDefinitionToObject;
