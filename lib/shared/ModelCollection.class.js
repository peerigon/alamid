"use strict";

var Class = require("nodeclass").Class,
    Collection = require("./Collection.class.js"),
    _ = require("underscore");

var ModelCollection = new Class({

    Extends: Collection,

    /**
     * @type Array
     * @private
     */
    __changeListeners: [],

    /**
     * @type Array
     * @private
     */
    __changeListenersModels: [],

    /**
     * @param {Class} ModelClass
     * @param {array|Models} models
     * @constructor
     */
    init: function (ModelClass, models) {

        if (ModelClass === undefined) {
            //Require Model.class as work-around to prevent a circular-dependency
            ModelClass = require("./Model.class.js");
        }

        this.Super(ModelClass, models);

    },

    /**
     * @param {number} index
     * @param {Model} model
     * @return {ModelCollection}
     */
    set: function (index, model) {

        var elements = this.Super._getElements(),
            changeListener;

        if (elements[index]) {
            elements[index].removeListener("change", this.__findChangeListener(elements[index]));
        }

        model.on("change", this.__createChangeListener(model));

        this.Super.set(index, model);

        return this.Instance;
    },

    /**
     * @return {Model}
     */
    pop: function () {
        var poppedModel = this.Super.pop(),
            changeListener;

        changeListener = this.__findChangeListener(poppedModel);
        poppedModel.removeListener("change", changeListener);

        return poppedModel;
    },

    /**
     * @return {Model}
     */
    shift: function () {
        var shiftedModel = this.Super.shift(),
            changeListener;

        changeListener = this.__findChangeListener(shiftedModel);
        shiftedModel.removeListener("change", changeListener);

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

        _(models).each(function addChangeListener(model, index) {
            model.on("change", self.__createChangeListener(model));
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

        _(models).each(function addChangeListener(model, index) {
            model.on("change", self.__createChangeListener(model));
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
        var elements = this.Super._getElements(),
            elementsLength = elements.length;

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

        this.Super.each(function disposeEachModel(model, index) {
            model.removeListener("change", self.__findChangeListener(model));
        });

        this.Super._setElements([]);
    },

    /**
     * @param {Model} model
     * @return {function}
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
     * @param {Model} changeListenerModel
     * @return {function}
     * @private
     */
    __findChangeListener: function (changeListenerModel) {
        var changeListenerIndex;

        _(this.__changeListenersModels).find(function findEventListenerIndex(model, index) {
            if(changeListenerModel === model) {
                changeListenerIndex = index;
                return true;
            }
        });

        return this.__changeListeners[changeListenerIndex];
    }

});

module.exports = ModelCollection;