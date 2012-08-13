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

    /**
     * @param {Model} model
     * @return {View}
     */
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

        return this.Instance;
    },

    /**
     * @return {View}
     */
    unbind: function () {
        if (this.__model) {
            this.__model.removeListener('change', this.render);
            this.__model = null;
        }

        return this.Instance;
    },

    /**
     * @param {Object.<string, string>} renderData
     * @return {View}
     */
    render: function (renderData) {
        var nodeMap = this.Super._getNodeMap(),
            nodeRenderData;

        //Check if there is any data to render
        if (renderData === undefined && this.__model === null) {
            throw new Error("(alamid) Unable to render View. No data given and no Model was bound.");
        }

        if (renderData === undefined && this.__model !== null) {
            renderData = this.__model.escape();
        }

        this.Super.emit("beforeRender");

        _(nodeMap).each(function nodeMapIterator(node, nodeName) {
            nodeRenderData = renderData[nodeName];

            if (nodeRenderData !== undefined) {
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

        this.Super.emit("render");

        return this.Instance;
    },

    /**
     * Call to unbind() and Super's dipose();
     * @see DisplayObject.dispose
     */
    dispose: function dispose() {
        this.unbind();
        this.Super.dispose();
    }

});

module.exports = View;