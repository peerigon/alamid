"use strict";

var Collection = require("./Collection.class.js"),
    value = require("value"),
    _ = require("underscore");

var ModelCollection = Collection.extend("ModelCollection", {

    /**
     * @type {Object}
     * @private
     */
    __listeners: null,

    /**
     * @param {Class} ModelClass
     * @param {Array<Model>} models
     *
     * @constructor
     */
    constructor: function (ModelClass, models) {
        this.__listeners = {
            models: [],
            change: [],
            destroy: []
        };
    },

    /**
     * @param {number} index
     * @param {Model} model
     * @return {ModelCollection}
     */
    set: function (index, model) {
        var models = this._elements;

        if (models[index]) {
            this.remove(index);
        }
        this._addModelListeners(model);
        this._super(index, model);

        return this;
    },

    /**
     * @param {Number|Model} modelOrIndex
     * @return {Model}
     */
    remove: function (modelOrIndex) {
        var removeModel,
            removeIndex;

        // if given param is an index
        if (value(modelOrIndex).typeOf(Number)) {
            removeIndex = modelOrIndex;
        } else {
            // if given param is a Model
            removeModel = modelOrIndex;
            removeIndex = _(this._elements).indexOf(removeModel);
        }

        removeModel = this._super(removeIndex);
        this._removeModelListeners(removeModel);

        return removeModel;
    },

    /**
     * @return {Model}
     */
    pop: function () {
        var poppedModel = this._super();

        this._removeModelListeners(poppedModel);

        return poppedModel;
    },

    /**
     * @return {Model}
     */
    shift: function () {
        var shiftedModel = this._super();

        this._removeModelListeners(shiftedModel);

        return shiftedModel;
    },

    /**
     * @param {Model} models
     * @return {ModelCollection}
     */
    push: function (models) {
        if (value(models).notTypeOf(Array)) {
            models = [models];
        }

        _(models).each(this._addModelListeners, this);

        this._super(models);

        return this;
    },

    /**
     * @param {Model} models
     * @return {ModelCollection}
     */
    unshift: function (models) {
        if (value(models).notTypeOf(Array)) {
            models = [models];
        }

        _(models).each(this._addModelListeners, this);
        this._super(models);

        return this;
    },

    /**
     * @param {string} modelAttribute
     * @param {boolean} descending (optional)
     * @return {ModelCollection}
     */
    sortBy: function (modelAttribute, descending) {
        var elements = this._elements;

        elements = _(elements).sortBy(function sortModelBy(model, index) {
            return model.get(modelAttribute);
        });

        if (descending === true) {
            elements.reverse();
        }

        this._elements = elements;
        this.emit("sort");

        return this;
    },

    /**
     * Prepares the ModelCollection for the Garbage Collector
     */
    dispose: function () {
        _(this._elements).each(this._removeModelListeners, this);
        this._super();
    },

    /**
     * @param {Model} model
     * @private
     */
    _addModelListeners: function (model) {
        var self = this;

        function onChange() {
            self.emit("change", model);
        }

        function onDestroy(err) {
            if (!err) {
                model.removeListener("destroy", onDestroy);
                self.remove(model);
            }
        }

        model.on("change", onChange);
        model.on("destroy", onDestroy);

        this.__listeners.models.push(model);
        this.__listeners.change.push(onChange);
        this.__listeners.destroy.push(onDestroy);
    },

    /**
     * @param {Model} model
     */
    _removeModelListeners: function (model) {
        var listenerModelIndex = _(this.__listeners.models).indexOf(model);

        model.removeListener("change", this.__listeners.change[listenerModelIndex]);
        model.removeListener("destroy", this.__listeners.destroy[listenerModelIndex]);
    }
});

module.exports = ModelCollection;