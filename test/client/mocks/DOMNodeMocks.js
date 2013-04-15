"use strict";

var DOMNodeMocks = {

    /**
     * @type {Node}
     */
    __incubator: document.createElement("div"),

    /**
     * @return {String}
     */
    getSubmitButtonString: function () {
        return "<input data-node='submitButton' type='submit' value='submit'/>";
    },

    /**
     * @return {Node}
     */
    getSubmitButton: function () {
        this.__incubator.innerHTML = this.getSubmitButtonString();

        return this.__incubator.firstChild;
    },

    /**
     * @return {String}
     */
    getUlString: function () {
        return "<ul data-node='views'></ul>";
    },

    /**
     * @return {Node}
     */
    getUl: function () {
        this.__incubator.innerHTML = this.getUlString();

        return this.__incubator.firstChild;
    },

    /**
     * @return {String}
     */
    getOlString: function () {
        return "<ul data-node='views'></ul>";
    },

    /**
     * @return {Node}
     */
    getOl: function () {
        this.__incubator.innerHTML = this.getOlString();

        return this.__incubator.firstChild;
    },

    /**
     * @return {String}
     */
    getAString: function () {
        return "<a href='waterloo/to/anywhere' >";
    },

    /**
     * @return {Node}
     */
    getA: function () {
        this.__incubator.innerHTML = this.getAString();

        return this.__incubator.firstChild;
    }

};

module.exports = DOMNodeMocks;