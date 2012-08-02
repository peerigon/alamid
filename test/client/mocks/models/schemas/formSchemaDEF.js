"use strict";

/**
 * DOMNodeMocks provides only one form with dom-nodes-names like the following keys.
 * So don't get confused with the default values.
 */
var formSchemaDEF = {
    "input-a": {
        type: String,
        required: true,
        default: "d"
    },
    "input-b": {
        type: String,
        required: true,
        default: "e"
    },
    "input-c": {
        type: String,
        required: true,
        default: "f"
    }
};

module.exports = formSchemaDEF;