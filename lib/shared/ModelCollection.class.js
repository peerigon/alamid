"use strict";

var Collection = require("./Collection.class.js"),
    value = require("value"),
    _ = require("underscore");

var ModelCollection = Collection.extend("ModelCollection", {

    constructor: function () {
        this._onModelDestroy = this._onModelDestroy.bind(this);
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
        var removeModel = null,
            removeIndex;

        // if given param is an index
        if (value(modelOrIndex).typeOf(Number)) {
            removeIndex = modelOrIndex;
        } else {
            // if given param is a Model
            removeModel = modelOrIndex;
            removeIndex = _(this._elements).indexOf(removeModel);
        }

        if (removeIndex > -1 && removeIndex < this._elements.length) {
            removeModel = this._super(removeIndex);
            this._removeModelListeners(removeModel);
        }

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
     * @param {String} id
     * @returns {*}
     */
    findById: function (id) {
        return _(this._elements).find(function matchesId(model) {
            return model.getId() === id;
        });
    },

    /**
     * @param {String} id
     * @returns {*}
     */
    removeById: function (id) {
        var index,
            model;

        model = _(this._elements).find(function matchesId(model, i) {
            index = i;
            return model.getId() === id;
        });

        if (model === undefined) {
            return undefined;
        }

        return this.remove(index);
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
        model.on("destroy", this._onModelDestroy);
    },

    /**
     * @param {Model} model
     */
    _removeModelListeners: function (model) {
        model.removeListener("destroy", this._onModelDestroy);
    },

    _onModelDestroy: function (event) {
        this.remove(event.target);
    }
});

module.exports = ModelCollection;