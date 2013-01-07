"use strict";

var View = require("../../../lib/client/View.class.js");

var ViewExample = View.extend("ViewExample", {

    /**
     * Exposes append
     *
     * @param {DisplayObject} displayObject
     * @return {Object.<string, function(string): DisplayObject>}
     */
    append: function(displayObject) {
        return this._append(displayObject);
    },

    /**
     * Exposes prepend
     *
     * @param {DisplayObject} displayObject
     * @return {Object.<string, function(string): DisplayObject>}
     */
    prepend: function(displayObject) {
        return this._prepend(displayObject);
    }

});

module.exports = ViewExample;