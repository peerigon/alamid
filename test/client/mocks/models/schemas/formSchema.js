"use strict";

var formSchema = {

    "text": {

        "type": String,
        "required": true,
        "default": "textInput"

    },

    "textarea": {

        "type": String,
        "required": true,
        "default": "textArea"

    },

    "range": {

        "type": Number,
        "required": true,
        "default": 0

    },

    "checkbox": {

        "type": Boolean,
        "required": true,
        "default": false

    },

    "radio": {

        "type": Boolean,
        "required": true,
        "default": false

    },

    "button": {

        "type": String,
        "required": true,
        "default": "button"

    },

    "submit": {

        "type": String,
        "required": true,
        "default": "submit"

    },

    "date": {

        "type": Date,
        "required": true,
        "default": new Date(1986, 5, 3, 9, 33, 59)

    },

    "time": {

        "type": Date,
        "required": true,
        "default": new Date(1986, 5, 3, 9, 33, 59)

    },

    "datetime": {

        "type": Date,
        "required": true,
        "default": new Date(1986, 5, 3, 9, 33, 59)

    },

    "img": {

        "type": String,
        "required": true,
        "default": "img.png"

    }

};

module.exports = formSchema;