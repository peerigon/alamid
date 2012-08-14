"use strict";

var Class = require("nodeclass").Class,
    Page = require("../../../lib/client/Page.class.js");

//@TODO use Page.define
/*
var PageExample = Page.define({

    /**
     * Exposes protected ._getParams()
     * @return {object}
     */
    /*
    getParams: function () {
        return this._getParams();
    },

    /**
     * Exposes ._isDisposed()
     * @return {boolean}
     */
/*
    isDisposed: function () {
        return this._isDisposed();
    },

    $template: "<div data-node='page'></div>"

});
*/
var PageExample = new Class({

    Extends: Page,

    /**
     * Exposes protected ._getParams()
     * @return {object}
     */
    getParams: function () {
        return this.Super._getParams();
    },

    /**
     * Exposes ._isDisposed()
     * @return {boolean}
     */
    isDisposed: function () {
        return this.Super._getIsDisposed();
    },

    $template: "<div data-node='page'></div>"

});


module.exports = PageExample;