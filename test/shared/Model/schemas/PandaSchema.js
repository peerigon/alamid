"use strict";

var PandaSchema = {
    name: {
        type: String,
        required: true
    },
    mood : { type : String, "enum": ["happy", "hungry", "crazy"] },
    pooCount : { type : Number, min: 10, max : 100 }
};

module.exports = PandaSchema;