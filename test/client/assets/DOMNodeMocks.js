var DOMNodeMocks = DOMNodeMocks || {};

(function (window) {
    "use strict";

    var incubator = document.createElement("div");

    DOMNodeMocks.getForm = function () {

        incubator.innerHTML =
            "<form data-node='child-form' action='?' method='post'>" +
                "<input data-node='child-input-a' type='text' value='a'/>" +
                "<input data-node='child-input-b' type='text' value='b'/>" +
                "<input data-node='child-input-c' type='button' value='c'/>" +
            "</form>";

        return incubator.firstChild;
    };

})(window);