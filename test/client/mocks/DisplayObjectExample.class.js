"use strict";

var DisplayObject = require("../../../lib/client/DisplayObject.class.js");

/**
 * This is a mock for testing DisplayObject's append() by making it a public method.
 */
var DisplayObjectExample = DisplayObject.extend("DisplayObjectExample", {

    template: "<div></div>",

    /**
     *
     * How to use: displayObjectInstance.append(new displayObjectInstance()).at("nodeName").
     *
     * @param {!DisplayObject} displayObject
     * @return {Object.<string, function(string): DisplayObject>}
     * @protected
     */
    append: function (displayObject) {
        return this._append(displayObject);
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
        return this._prepend(displayObject);
    },

    /**
     * Exposing protected _addNodeEvents for testing.
     *
     * @param nodeEvents
     */
    addNodeEvents: function (nodeEvents) {
        this._addNodeEvents(nodeEvents);
    },

    /**
     * @return {Object.<string, node>}
     */
    getNodeMap: function () {
        return this._nodeMap;
    }

});

module.exports = DisplayObjectExample;