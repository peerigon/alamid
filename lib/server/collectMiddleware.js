"use strict";

var path = require("path"),
    _ = require("underscore");

var config = require("../shared/config");


function collectMiddleware(middlewarePath, callback) {

    var middlewareDefinitions,
        middleware = {};

    var expectedResult = {
        "services" : {
            "blogPost" : {
                "create" : [],
                "delete" : []
            },
            "blogPost/comment/" : {
                "create" : [],
                "delete" : []
            }
        }
    };

    if(!path.exists(middlewarePath)) {
        callback(null, {});
        return;
    }

    middlewareDefinitions = require(middlewarePath);

}

function middlewareDefinitionToObject(middlewareObj) {

    var resObj = { };

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

    var activePath,
        keyParts;

    //populate paths
    _(middlewareObj).each(function(mwMethods, mwKey) {
        keyParts = parseKey(mwKey);
        resObj[keyParts.reqPath] = {};
    });

    //add methods
    _(middlewareObj).each(function(mwMethods, mwKey) {

        //we only want arrays
        if(!_(mwMethods).isArray()) {
            mwMethods = [mwMethods];
        }

        keyParts = parseKey(mwKey);
        resObj[keyParts.reqPath] = {};

        for(var i = 0; i < keyParts.methods.length; i++) {

            if(resObj[keyParts.reqPath][keyParts.methods[i]] === undefined) {
                resObj[keyParts.reqPath][keyParts.methods[i]] = [];
            }
            resObj[keyParts.reqPath][keyParts.methods[i]] = _(resObj[keyParts.reqPath][keyParts.methods[i]]).extend(mwMethods);
        }

        //update paths
        _(resObj).each(function(resMwMethods, resMwPaths) {

            //console.log("each: " + resMwPaths);

            if(resMwPaths.indexOf(keyParts.reqPath) !== -1 && resMwPaths !== keyParts.reqPath) {
                //console.log("found overwrite for: ", resMwPaths);
                //console.log("old methods: ", resMwMethods);

                var newMethods = _(resMwMethods).extend(resObj[keyParts.reqPath]);

                //console.log("newMethods", newMethods);
                resObj[resMwPaths] = newMethods;
            }
        });
    });

    return resObj;
}

function addMethods(pathObject, methods) {


    for(var i = 0; i < methods.length; i++) {
        if(_(pathObject[keyParts.methods[i]]).isArray()) {
            pathObject[keyParts.methods[i]].push(methods);
        }
        else {
            pathObject[keyParts.methods[i]] = mwMethods;
        }
    }
}

exports.middlewareDefintionToObject = middlewareDefinitionToObject;
