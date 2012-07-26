"use strict";

var Class = require("nodeclass").Class,
    Model = require("./Model.class.js"),
    is = require("nodeclass").is,
    EventEmitter = require("./EventEmitter.class.js"),
    _ = require("underscore");

var ModelCollection = new Class({

    Extends: EventEmitter,

    /**
     * @type {boolean}
     * @private
     */
    __isMuted: false,

    /**
     * @type {Model}
     * @private
     */
    __ModelClass: null,

    /**
     * @type {array}
     * @private
     */
    __models: [],

    /**
     * @param {Class} ModelClass
     * @constructor
     */
    init: function (ModelClass) {

        if (ModelClass !== undefined) {
            this.__ModelClass = ModelClass;
        } else {
            this.__ModelClass = Model;
        }

    },

    getModelClass: function () {
        return this.__ModelClass;
    },

    /**
     * @param {boolean}isMuted
     * @return {ModelCollection}
     */
    setMuted: function (isMuted) {
        this.__isMuted = isMuted;
        return this.Instance;
    },

    /**
     * @return {Model}
     */
    pop: function () {

        var model = this.__models.pop();

        model.removeListener("change", this.__emitChange);

        this.__emitChange();

        return model;
    },

    /**
     * @return {Model}
     */
    shift: function () {

        var model = this.__models.shift();

        model.removeListener("change", this.__emitChange);

        this.__emitChange();

        return model;
    },


    /**
     * @param {array|Model} models
     * @return {ModelCollection}
     */
    push: function (models) {

        var self = this;
        //make models iterable
        if (_(models).isArray() === false) {
            models = [models];
        }

        _(models).each(function pushModel(model, index) {
            if (is(model).notInstanceOf(self.__ModelClass)) {
                throw new TypeError(
                    "(alamid) Can not push model (at index: " + index + "). Wrong type of model."
                );
            }

            model.on("change", self.__emitChange);

            self.__models.push(model);
        });

        this.__emitChange();

        return this.Instance;
    },

    /**
     * @param {array|Model} models
     * @return {ModelCollection}
     */
    unshift: function (models) {

        var self = this;
        //make models iterable
        if (_(models).isArray() === false) {
            models = [models];
        }

        _(models).each(function unshiftModel(model, index) {
            if (is(model).notInstanceOf(self.__ModelClass)) {
                throw new TypeError(
                    "(alamid) Can not unshift model (at index: " + index + "). Wrong type of model."
                );
            }

            model.on("change", self.__emitChange);

            self.__models.unshift(model);
        });

        this.__emitChange();

        return this.Instance;
    },

    /**
     * NOTE: All "change"-listeners added to models of a collection given to union will be removed.
     *
     * @param {array|ModelCollection} modelCollections
     * @return {ModelCollection}
     */
    union: function (modelCollections) {

        var self = this;

        if (_(modelCollections).isArray() === false) {
            modelCollections = [modelCollections];
        }

        _(modelCollections).each(function modelCollectionsIterator(modelCollection, index) {
            if (is(modelCollection).notInstanceOf(ModelCollection)) {
                throw new TypeError(
                    "(alamid) Unable to union with element (at index: " + index + "). " +
                    "Argument is not instance of ModelCollection."
                );
            }
            modelCollection.each(function unionModels (model, index) {
                model.removeAllListeners("change");
                model.addListener("change", self.__emitChange);
                self.__models = _(self.__models).union(model);
            });
        });

        this.__emitChange();

        return this.Instance;
    },

    /**
     * @return {ModelCollection}
     */
    reverse: function() {
        this.__models.reverse();

        return this.Instance;
    },

    /**
     * @return {Number}
     */
    size: function () {
        return this.__models.length;
    },

    /**
     * @param {function} iterator
     */
    each: function (iterator) {
        _(this.__models).each(iterator);
    },

    /**
     * @param {string} modelAttribute
     * @param {boolean} descending (optional)
     * @return {ModelCollection}
     */
    sortBy: function (modelAttribute, descending) {

        if (this.__models[0].get(modelAttribute) === undefined) {
            throw new Error(
                "(alamid) Unable to sort by " + modelAttribute +
                ". Models do not have an attribute called " + modelAttribute + "."
            );
        }

        this.__models = _(this.__models).sortBy(function sortModelBy(model, index) {
            return model.get(modelAttribute);
        });

        if (descending === true) {
            this.__models.reverse();
        }

        this.__emitChange();

        return this.Instance;
    },

    /**
     * @param {function.<model, index>} filterIterator
     * @return {array}
     */
    filter: function (filterIterator) {
        return _(this.__models).filter(filterIterator);
    },

    /**
     * @private
     */
    __emitChange: function () {
        if (this.__isMuted === false) {
            this.Super.emit("change");
        }
    }

});

module.exports = ModelCollection;