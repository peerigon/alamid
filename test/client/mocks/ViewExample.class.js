"use strict";

var Class = require("nodeclass").Class,
    View = require("../../../lib/client/View.class.js");

var ViewExample = new Class("ViewExample", {

    Extends: View,

    /**
     * Exposes append
     *
     * @param {DisplayObject} displayObject
     * @return {Object.<string, function(string): DisplayObject>}
     */
    append: function(displayObject) {
        return this.Super._append(displayObject);
    },

    /**
     * Exposes prepend
     *
     * @param {DisplayObject} displayObject
     * @return {Object.<string, function(string): DisplayObject>}
     */
    prepend: function(displayObject) {
        return this.Super._prepend(displayObject);
    }

});

module.exports = ViewExample;