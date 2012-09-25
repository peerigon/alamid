"use strict";

var Class = require("nodeclass").Class;

var Page = require("../Page.class.js"),
    domAdapter = require("../helpers/domAdapter.js");

var Default404Page = new Class("Default404Page", {

    Extends: Page,

    /**
     * @type {Object}
     */
    __nodeMap: null,

    init: function () {

        var params = {},
            template =
                "<div data-node='page'>" +
                    "<h1 data-node='title'></h1>" +
                    "<h2 data-node='sub'></h2>" +
                    "<p data-node='message'></p>" +
                    "<div data-node='info'></div>" +
                "</div>";

        this.Super({}, template);

        this.__nodeMap = this.Super._getNodeMap();

    },

    /**
     * @param {String} title
     * @return {Default404Page}
     */
    setTitle: function (title) {
        this.__nodeMap.title.textContent = title;

        return this.Instance;
    },

    /**
     * @param {String} sub
     * @return {Default404Page}
     */
    setSubTitle: function(sub) {
        this.__nodeMap.sub.textContent = sub;

        return this.Instance;
    },

    /**
     * @param {String} message
     * @return {Default404Page}
     */
    setMessage: function (message) {
        this.__nodeMap.message.textContent = message;

        return this.Instance;
    },

    /**
     * @param {Object} info
     * @return {Default404Page}
     */
    setInfo: function (info) {
        this.__nodeMap.info.textContent = JSON.stringify(info, null, 4);

        return this.Instance;
    }

});

module.exports = Default404Page;