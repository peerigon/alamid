"use strict";

var _ = require("underscore");

var crudToHttp = {
    "create" : "post",
    "read" : "get",
    "update" : "put",
    "destroy" : "delete"
};

//switch keys & values
var httpToCrud = _(crudToHttp).invert();

/**
 * converts originalMethod as defined in methodMap
 * @param originalMethod
 * @param methodMap
 * @returns {*}
 */
function convert(originalMethod, methodMap) {

    var convertedMethod,
        targetMethod = _(methodMap).values();

    originalMethod = originalMethod.toLowerCase();

    //is method already converted?
    if (_(targetMethod).contains(originalMethod)) {
        return originalMethod;
    }

    convertedMethod = methodMap[originalMethod];

    if (!convertedMethod) {
        throw new Error("(alamid) Unsupported method: " + originalMethod);
    }

    return convertedMethod;
}

/**
 * convert CRUD-method to suitable HTTP-method
 * @param {String} crudMethod
 * @return {String}
 */
function convertCRUDtoHTTP(crudMethod) {
    return convert(crudMethod, crudToHttp);
}

/**
 * converts HTTP-method to CRUD-method
 * @param httpMethod
 * @return {String}
 */
function convertHTTPtoCRUD(httpMethod) {
    return convert(httpMethod, httpToCrud);
}

exports.convertCRUDtoHTTP = convertCRUDtoHTTP;
exports.convertHTTPtoCRUD = convertHTTPtoCRUD;