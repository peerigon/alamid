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

    DOMNodeMocks.getSubmitButtonString = function () {
        return "<input data-node='submit-button' type='submit' value='submit'/>";
    };

    DOMNodeMocks.getSubmitButton = function () {

        incubator.innerHTML = this.getSubmitButtonString();

        return incubator.firstChild;
    };

})(window);