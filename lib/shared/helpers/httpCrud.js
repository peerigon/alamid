"use strict";

/**
 * convert CRUD-method to suitable HTTP-method
 * @param {String} method
 * @return {String}
 */
function convertCRUDtoHTTP(method) {
    switch(method.toLowerCase()) {
            case "create":
                return "post";
            case "read":
                return "get";
            case "update":
                return "put";
            case "destroy":
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
    switch(method.toLowerCase()) {
        case "post":
            return "create";
        case "get":
            return "read";
        case "put":
            return "update";
        case "delete":
            return "destroy";
    }
    throw new Error("(alamid) Unsupported method: " + method);
}

exports.convertCRUDtoHTTP = convertCRUDtoHTTP;
exports.convertHTTPtoCRUD = convertHTTPtoCRUD;