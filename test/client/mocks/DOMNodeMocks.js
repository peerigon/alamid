var DOMNodeMocks = DOMNodeMocks || {};

(function (window) {
    "use strict";

    var incubator = document.createElement("div");

    /**
     * @return {String}
     */
    DOMNodeMocks.getFormString = function () {
        return (
            "<form data-node='form' action='?' method='post'>" +
                "<input data-node='input-a' type='text' value='a'/>" +
                "<input data-node='input-b' type='text' value='b'/>" +
                "<input data-node='input-c' type='button' value='c'/>" +
            "</form>"
        );
    };

    /**
     * @return {Node}
     */
    DOMNodeMocks.getForm = function () {

        incubator.innerHTML = this.getFormString();

        return incubator.firstChild;
    };

    /**
     * @return {String}
     */
    DOMNodeMocks.getSubmitButtonString = function () {
        return "<input data-node='submit-button' type='submit' value='submit'/>";
    };

    /**
     * @return {Node}
     */
    DOMNodeMocks.getSubmitButton = function () {

        incubator.innerHTML = this.getSubmitButtonString();

        return incubator.firstChild;
    };

    /**
     * @return {String}
     */
    DOMNodeMocks.getUlString = function () {
        return "<ul data-node='views'></ul>";
    };

    /**
     * @return {Node}
     */
    DOMNodeMocks.getUl = function () {

        incubator.innerHTML = this.getUlString();

        return incubator.firstChild;
    };

    /**
     * @return {String}
     */
    DOMNodeMocks.getOlString = function () {
        return "<ul data-node='views'></ul>";
    };

    /**
     * @return {Node}
     */
    DOMNodeMocks.getOl = function () {

        incubator.innerHTML = this.getOlString();

        return incubator.firstChild;
    };



})(window);