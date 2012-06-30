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
                "<input data-node='child-input-a' type='text' value='a'/>" +
                "<input data-node='child-input-b' type='text' value='b'/>" +
                "<input data-node='child-input-c' type='button' value='c'/>" +
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

})(window);