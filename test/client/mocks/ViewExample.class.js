"use strict";

var View = require("../../../lib/client/View.class.js");

var ViewExample = View.extend("ViewExample", {

    /**
     * Exposes append
     *
     * @param {Displayable} displayable
     * @return {Object.<string, function(string): Displayable>}
     */
    append: function(displayable) {
        return this._append(displayable);
    },

    /**
     * Exposes prepend
     *
     * @param {Displayable} displayable
     * @return {Object.<string, function(string): Displayable>}
     */
    prepend: function(displayable) {
        return this._prepend(displayable);
    }

});

module.exports = ViewExample;