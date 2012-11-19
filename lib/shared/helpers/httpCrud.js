"use strict";

/**
 * convert CRUD-method to suitable HTTP-method
 * @param {String} method
 * @return {String}
 */
function convertCRUDtoHTTP(method) {
    switch(method.toUpperCase()) {
            case "CREATE":
                return "post";
            case "READ":
                return "get";
            case "UPDATE":
                return "put";
            case "DESTROY":
                return "delete";
        }
        throw new Error("(alamid) Unsupported method: " + method);
}

/**
 * converts HTTP-method to CRUD-method
 * @param method
 * @return {String}
 */
function convertHTTPtoCRUD (method) {
    switch(method.toUpperCase()) {
        case "POST":
            return "create";
        case "GET":
            return "read";
        case "PUT":
            return "update";
        case "DELETE":
            return "destroy";
    }
    throw new Error("(alamid) Unsupported method: " + method);
}

exports.convertCRUDtoHTTP = convertCRUDtoHTTP;
exports.convertHTTPtoCRUD = convertHTTPtoCRUD;