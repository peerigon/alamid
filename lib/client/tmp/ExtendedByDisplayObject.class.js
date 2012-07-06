"use strict";

var Class = require("nodeclass").Class,
    DisplayObject = require("../DisplayObject.class.js");

/**
 * This is a mock for testing DisplayObject's append() by making it a public method.
 */
var ExtendedByDisplayObject = new Class({

    Extends: DisplayObject,

    /**
     *
     * How to use: displayObjectInstance.append(new displayObjectInstance()).at("nodeName").
     *
     * @param {!DisplayObject} displayObject
     * @return {Object.<string, function(string): DisplayObject>}
     * @protected
     */
    append: function (displayObject) {
        return this.Super._append(displayObject);
    }

});

module.exports = ExtendedByDisplayObject;