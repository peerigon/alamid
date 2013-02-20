"use strict";

var View = require("../../../lib/client/View.class.js");

var FormView = View.extend("FormView", {
    template:
        '<div data-node="formView">' +

            '<h1 data-node="headline"></h1>' +

            '<div data-node="message"></div>' +

            '<form>' +

                '<fieldset>' +

                    '<input type="text" data-node="text"/>' +

                    '<textarea data-node="textarea"></textarea>' +

                    '<input type="range" data-node="range"/>' +

                    '<input type="checkbox" data-node="checkbox"/>' +

                    '<input type="radio" data-node="radio"/>' +

                    '<input type="button" data-node="button"/>' +

                    '<input type="submit" data-node="submit"/>' +

                    '<input type="date" data-node="date"/>' +

                    '<input type="time" data-node="time"/>' +

                    '<input type="datetime" data-node="datetime"/>' +

                    '<img data-node="img"/>' +

                '</fieldset>' +

            '</form>' +
    '</div>'

});

module.exports = FormView;