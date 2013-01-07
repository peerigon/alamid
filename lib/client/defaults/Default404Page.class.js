"use strict";

var Page = require("../Page.class.js"),
    domAdapter = require("../helpers/domAdapter.js");

var Default404Page = Page.extend("Default404Page", {
    constructor: function () {
        var template =
                "<div data-node='page'>" +
                    "<h1 data-node='title'></h1>" +
                    "<h2 data-node='sub'></h2>" +
                    "<p data-node='message'></p>" +
                    "<div data-node='info'></div>" +
                "</div>";

        this._super({}, template);
    },

    /**
     * @param {String} title
     * @return {Default404Page}
     */
    setTitle: function (title) {
        this._nodeMap.title.textContent = title;

        return this;
    },

    /**
     * @param {String} sub
     * @return {Default404Page}
     */
    setSubTitle: function(sub) {
        this._nodeMap.sub.textContent = sub;

        return this;
    },

    /**
     * @param {String} message
     * @return {Default404Page}
     */
    setMessage: function (message) {
        this._nodeMap.message.textContent = message;

        return this;
    },

    /**
     * @param {Object} info
     * @return {Default404Page}
     */
    setInfo: function (info) {
        this._nodeMap.info.textContent = JSON.stringify(info, null, 4);

        return this;
    }

});

module.exports = Default404Page;