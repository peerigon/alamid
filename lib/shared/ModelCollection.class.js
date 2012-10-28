"use strict";

var Class = require("nodeclass").Class,
    Nodeclass = Class,
    Collection = require("./Collection.class.js"),
    _ = require("underscore");

var ModelCollection = new Class("ModelCollection", {

    Extends: Collection,

    /**
     * @type {Object}
     * @private
     */
    __listeners: null,

    /**
     * @param {String} className
     * @param {Object} descriptor
     * @return {Function}
     */
    $define: function (className, descriptor) {

        descriptor.Extends = ModelCollection;

        return new Nodeclass(className, descriptor);

    },

    /**
     * @param {Class} ModelClass
     * @param {array|Models} models
     *
     * @constructor
     */
    init: function (ModelClass, models) {

        this.__listeners = {
            models: [],
            change: [],
            delete: []
        };

        this.Super(ModelClass);

        if (models !== undefined) {
            this.push(models);
        }

    },

    /**
     * @param {number} index
     * @param {Model} model
     * @return {ModelCollection}
     */
    set: function (index, model) {

        var models = this.Super._getElements();

        if (models[index]) {
            this._removeModelListeners(models[index]);
        }
        this._addModelListeners(model);

        this.Super.set(index, model);

        return this.Instance;
    },

    /**
     * @param {Number|Model} modelOrIndex
     * @return {Model}
     */
    remove: function (modelOrIndex) {

        var removeModel,
            removeIndex;

        // if given param is an index
        if (typeof modelOrIndex === "number") {
            removeIndex = modelOrIndex;
        } else {
            // if given param is a Model
            removeModel = modelOrIndex;
            removeIndex = _(this.Super._getElements()).indexOf(removeModel);
        }

        removeModel = this.Super.remove(removeIndex);
        this._removeModelListeners(removeModel);

        return removeModel;

    },

    /**
     * @return {Model}
     */
    pop: function () {
        var poppedModel = this.Super.pop();

        this._removeModelListeners(poppedModel);

        return poppedModel;
    },

    /**
     * @return {Model}
     */
    shift: function () {
        var shiftedModel = this.Super.shift();

        this._removeModelListeners(shiftedModel);

        return shiftedModel;
    },

    /**
     * @param {Model} models
     * @return {ModelCollection}
     */
    push: function (models) {
        var self = this;

        if (_(models).isArray() === false) {
            models = [models];
        }

        _(models).each(function addChangeListener(model) {
            //model.on("change", self.__createChangeListener(model));
            self._addModelListeners(model);
        });

        this.Super.push(models);

        return this.Instance;
    },

    /**
     * @param {Model} models
     * @return {ModelCollection}
     */
    unshift: function (models) {
        var self = this;

        if (_(models).isArray() === false) {
            models = [models];
        }

        _(models).each(function addChangeListener(model) {
            self._addModelListeners(model);
        });

        this.Super.unshift(models);

        return this.Instance;
    },

    /**
     * @param {string} modelAttribute
     * @param {boolean} descending (optional)
     * @return {ModelCollection}
     */
    sortBy: function (modelAttribute, descending) {

        var elements = this.Super._getElements();

        if (elements[0].get(modelAttribute) === undefined) {
            throw new Error(
                "(alamid) Unable to sort by " + modelAttribute + "." +
                "Models do not have an attribute called " + modelAttribute + "."
            );
        }

        elements = _(elements).sortBy(function sortModelBy(model, index) {
            return model.get(modelAttribute);
        });

        if (descending === true) {
            elements.reverse();
        }

        this.Super._setElements(elements);

        this.Super.emit("sort");

        return this.Instance;

    },

    /**
     * Prepares all Collection-Models for Garbage-Collector
     */
    dispose: function () {

        var self = this;

        _(this.Super._getElements()).each(function removeAllModelListeners(model) {
            self._removeModelListeners(model);
        });
        this.Super._setElements(null);

        this.Super.removeAllListeners();

    },

    /**
     * @param {Model} model
     * @return {Function}
     * @private
     */
    __createChangeListener: function (model) {

        var self = this;

        function changeListener() {
            self.Super.emit("change", model);
        }

        this.__changeListenersModels.push(model);
        this.__changeListeners.push(changeListener);

        return changeListener;
    },

    /**
     * @param {Model} model
     * @return {Function}
     * @private
     */
    _createChangeListener: function (model) {

        var self = this;

        function onChange() {
            self.Super.emit("change", model);
        }

        return onChange;

    },

    /**
     * @param {Model} model
     * @return {Function}
     * @private
     */
    _createDeleteListener: function (model) {

        var self = this;

        function onDelete(err) {

            if(!err) {
                model.removeListener("delete", onDelete);
                self.remove(model);
            }

        }

        return onDelete;

    },

    /**
     * @param {Model} model
     * @private
     */
    _addModelListeners: function (model) {

        var onChange = this._createChangeListener(model),
            onDelte = this._createDeleteListener(model);

        model.on("change", onChange);
        model.on("delete", onDelte);

        this.__listeners.models.push(model);
        this.__listeners.change.push(onChange);
        this.__listeners.delete.push(onDelte);

    },

    /**
     * @param {model}
     * @private
     */
    _removeModelListeners: function (model) {

        var listenerModelIndex = _(this.__listeners.models).indexOf(model);

        model.removeListener("change", this.__listeners.change[listenerModelIndex]);
        model.removeListener("delete", this.__listeners.delete[listenerModelIndex]);

    }


});

module.exports = ModelCollection;