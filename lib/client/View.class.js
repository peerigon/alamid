"use strict";

var value = require("value"),
    Model = require("../shared/Model.class.js"),
    Displayable = require("./Displayable.class.js"),
    _ = require("underscore");

var View = Displayable.extend("View", {

    /**
     * @type {Model}
     * @private
     */
    _model: null,

    /**
     * @param {Model} model
     * @return {View}
     */
    bind: function (model) {

        if (value(model).notTypeOf(Model)) {
            throw new Error("(alamid) Tried to bind an object not instance of Model to View");
        }

        if (this._model) {
            this.unbind();
        }

        this._model = model;

        model.on("change", this.render, this);
        model.on("destroy", this.dispose, this);

        this.render();

        return this;
    },

    /**
     * @return {View}
     */
    unbind: function () {

        if (this._model) {
            this._model.removeListener('change', this.render);
            this._model.removeListener('destroy', this.dispose);
            this._model = null;
        }

        return this;
    },

    /**
     * @return {Model|null}
     */
    getModel: function () {
        return this._model;
    },

    /**
     * @param {Object.<string, string>} data
     * @return {View}
     */
    render: function (data) {

        var nodes = this._nodes,
            model = this._model,
            node;

        if (data === undefined) {
            if (this._model === null) {
                throw new Error("(alamid) Unable to render View: There is neither data given nor a model bound to render.");
            }
            // no escaping needed as long as the content is not interpreted as html
            data = model.get();
        }

        this.emit("beforeRender");

        _(data).each(function renderNode(value, name) {
            node = nodes[name];
            if (node === undefined) {
                return; // skip
            }

            switch (node.tagName) {
                case "INPUT":
                case "TEXTAREA":
                    switch (node.type) {
                        case "text":
                        case "textarea":
                        case "button":
                        case "submit":
                        case "range":
                            node.value = value;
                            break;
                        case "radio":
                        case "checkbox":
                            if (value === "true") {
                                value = true;
                            } else if (value === "false") {
                                value = false;
                            }
                            node.checked = value;
                            break;
                        default:
                            node.value = value;
                            break;

                    }
                    break;
                case "IMG":
                    node.src = value;
                    break;
                default:
                    if (typeof node.textContent === "string") {
                        node.textContent = value;
                    } else {
                        node.innerText = value;
                    }
                    break;
            }
        });

        this.emit("render");

        return this;
    },

    /**
     * Unbinds the model and calls _super.dispose()
     */
    dispose: function dispose() {
        this.unbind();
        this._super();
    }

});

module.exports = View;