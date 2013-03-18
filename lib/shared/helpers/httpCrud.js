"use strict";

var crudToHttp = {
    "create" : "post",
    "read" : "get",
    "update" : "put",
    "destroy" : "delete"
};

var httpToCrud = {
    "post" : "create",
    "get" : "read",
    "put" : "update",
    "delete" : "destroy"
};

/**
 * convert CRUD-method to suitable HTTP-method
 * @param {String} method
 * @return {String}
 */
function convertCRUDtoHTTP(method) {

    method = method.toLowerCase();

    //is it already HTTP?
    if (httpToCrud[method] !== undefined) {
        return method;
    }

    method = crudToHttp[method];

    if (method === undefined) {
        throw new Error("(alamid) Unsupported method: " + method);
    }

    return method;
}

/**
 * converts HTTP-method to CRUD-method
 * @param method
 * @return {String}
 */
function convertHTTPtoCRUD(method) {

    method = method.toLowerCase();

    //is it already HTTP?
    if (crudToHttp[method] !== undefined) {
        return method;
    }

    method = httpToCrud[method];

    if (method === undefined) {
        throw new Error("(alamid) Unsupported method: " + method);
    }

    return method;
}

exports.convertCRUDtoHTTP = convertCRUDtoHTTP;
exports.convertHTTPtoCRUD = convertHTTPtoCRUD;