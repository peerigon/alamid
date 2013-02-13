"use strict";

var DOMNodeMocks = {

    /**
     * @type {Node}
     */
    __incubator: document.createElement("div"),

    /**
     * @return {String}
     */
    getFormString: function () {
        return (
            "<form data-node='form' action='?' method='post'>" +
                "<input data-node='input-a' type='text' value='a'/>" +
                "<input data-node='input-b' type='text' value='b'/>" +
                "<input data-node='input-c' type='button' value='c'/>" +
            "</form>"
        );
    },

    /**
     * @return {Node}
     */
    getForm: function () {
        this.__incubator.innerHTML = this.getFormString();

        return this.__incubator.firstChild;
    },

    /**
     * @return {String}
     */
    getSubmitButtonString: function () {
        return "<input data-node='submit-button' type='submit' value='submit'/>";
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