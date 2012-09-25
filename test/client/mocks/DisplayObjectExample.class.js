"use strict";

var Class = require("nodeclass").Class,
    DisplayObject = require("../../../lib/client/DisplayObject.class.js");

/**
 * This is a mock for testing DisplayObject's append() by making it a public method.
 */
var DisplayObjectExample = new Class("DisplayObjectExample", {

    Extends: DisplayObject,

    $template: "<div></div>",

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
    },

    /**
     *
     * How to use: displayObjectInstance.prepend(new displayObjectInstance()).at("nodeName").
     *
     * @param {!DisplayObject} displayObject
     * @return {Object.<string, function(string): DisplayObject>}
     * @protected
     */
    prepend: function (displayObject) {
        return this.Super._prepend(displayObject);
    },

    /**
     * Exposing protected _addNodeEvents for testing.
     *
     * @param nodeEvents
     */
    addNodeEvents: function (nodeEvents) {
        this.Super._addNodeEvents(nodeEvents);
    },

    /**
     * @return {Object.<string, node>}
     */
    getNodeMap: function () {
        return this.Super._getNodeMap();
    }

});

module.exports = DisplayObjectExample;