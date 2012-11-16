"use strict";

var Class = require("nodeclass").Class,
    NodeClass = Class,
    value = require("value"),
    Model = require("../shared/Model.class.js"),
    DisplayObject = require("./DisplayObject.class.js"),
    _ = require("underscore");

var View = new Class("View", {

    Extends: DisplayObject,

    /**
     * @type {Model}
     * @private
     */
    __model: null,

    /**
     * Returns a Class instance of View
     *
     * @param {!String} className
     * @param {!Object} descriptor
     * @return {Function}
     * @static
     */
    $define: function (className, descriptor) {

        descriptor.Extends = View;

        return new NodeClass(className, descriptor);
    },

    /**
     * @param {Model} model
     * @return {View}
     */
    bind: function (model) {

        if (value(model).notInstanceOf(Model)) {
            throw new Error("(alamid) Tried to bind an object not instance of Model to View");
        }

        if (this.__model) {
            this.unbind();
        }

        this.__model = model;

        model.on("change", this.render);
        model.on("destroy", this._destroyListener);

        this.render();

        return this.Instance;
    },

    /**
     * @return {View}
     */
    unbind: function () {

        if (this.__model) {
            this.__model.removeListener('change', this.render);
            this.__model.removeListener('destroy', this._destroyListener);
            this.__model = null;
        }

        return this.Instance;
    },

    /**
     * @return {Model|null}
     */
    getModel: function () {
        return this.__model;
    },

    /**
     * @param {Object.<string, string>} renderData
     * @return {View}
     */
    render: function (renderData) {

        var nodeMap = this.Super._getNodeMap(),
            nodeRenderData;

        /*
        function datetimePartToString(datetimePart) {

            if (datetimePart < 10) {

                datetimePart = "0" + datetimePart

            }

            datetimePart += "";

            return datetimePart
        }
        */

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

                switch (node.tagName) {

                    // <input type="?" value="nodeRenderData" checked="?">

                    case 'INPUT':
                    case 'TEXTAREA':

                        /*
                        var year,
                            month,
                            day,
                            hours,
                            minutes,
                            seconds;
                        */

                        switch (node.type) {

                            case "text":
                            case "textarea":
                            case "button":
                            case "submit":
                            case "range":
                            //case "date":
                            //case "time":
                            //case "datetime":

                                node.value = nodeRenderData;

                                break;

                            case "radio":
                            case "checkbox":

                                node.attributes.checked = nodeRenderData;

                                break;

                            /*
                            case "date":

                                year = datetimePartToString(nodeRenderData.getFullYear());
                                month = datetimePartToString(nodeRenderData.getMonth());
                                day = datetimePartToString(nodeRenderData.getDate());

                                node.value = year + "-" + month + "-" + day;

                                break;

                            case "time":

                                hours = datetimePartToString(nodeRenderData.getHours());
                                minutes = datetimePartToString(nodeRenderData.getMinutes());
                                seconds = datetimePartToString((nodeRenderData.getSeconds()));

                                node.value = hours + ":" + minutes + ":" + seconds;

                                break;

                            case "datetime":

                                year = datetimePartToString(nodeRenderData.getFullYear());
                                month = datetimePartToString(nodeRenderData.getMonth());
                                day = datetimePartToString(nodeRenderData.getDate());
                                hours = datetimePartToString(nodeRenderData.getHours());
                                minutes = datetimePartToString(nodeRenderData.getMinutes());
                                seconds = datetimePartToString((nodeRenderData.getSeconds()));

                                node.value = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

                                break;
                            */

                            default:

                                node.value = nodeRenderData;
                                break;

                        }


                        break;

                    case 'IMG':

                        node.attributes.src = nodeRenderData;

                        break;

                    default:

                        node.innerText = nodeRenderData;
                        break;

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
    },

    /**
     * @private
     */
    _destroyListener: function (err) {
        if (!err) {
            this.dispose();
        }
    }

});

module.exports = View;