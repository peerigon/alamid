"use strict";

var Class = require("nodeclass").Class,
    is = require("nodeclass").is,
    Model = require("../shared/Model.class.js"),
    DisplayObject = require("./DisplayObject.class.js"),
    _ = require("underscore");

var View = new Class({

    Extends: DisplayObject,

    /**
     * @type {Model}
     * @private
     */
    __model: null,

    bind: function (model) {

        if (is(model).notInstanceOf(Model)) {
            throw new Error("(alamid) Tried to bind an object not instance of Model to View");
        }

        if (this.__model) {
            this.unbind();
        }

        this.__model = model;

        model.on("change", this.render);

        this.render();
    },

    unbind: function () {
        if (this.__model) {
            this.__model.removeListener('change', this.render);
            this.__model = null;
        }
    },

    /**
     *
     * @param {object} renderData
     */
    render: function (renderData) {
        var nodeMap = this.Super.getNodeMap(),
            nodeRenderData;

        //Check if there is any data to rneder
        if (!renderData && this.__model) {
            if (this.__model) {
                renderData = this.__model.escape();
            } else {
                throw new Error("(alamid) Unable to render View. No data given and node Model bound.");
            }
        }

        _(nodeMap).each(function nodeMapIterator(node, nodeName) {

            nodeRenderData = renderData[nodeName];

            if (nodeRenderData === undefined) {
                if (nodeRenderData === null) {
                    nodeRenderData = "";
                }

                if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
                    node.value = nodeRenderData;
                } else {
                    node.innerHTML = nodeRenderData;
                }
            }
        });
    },

    dispose: function dispose() {
        this.unbind();
        this.Super.dispose();
    }

});

module.exports = View;