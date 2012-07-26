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
     * @protected
     */
    _isMuted: false,

    /**
     * @type {Class}
     * @protected
     */
    _Class: null,

    /**
     * @type {array}
     * @protected
     */
    _elements: [],

    /**
     * @param {Class} ModelClass
     * @constructor
     */
    init: function (Class) {

        if (Class !== undefined) {
            this._Class = Class;
        }

    },

    getClass: function () {
        return this._Class;
    },

    /**
     * @param {boolean}isMuted
     * @return {ModelCollection}
     */
    setMuted: function (isMuted) {
        this._isMuted = isMuted;
        return this.Instance;
    },

    /**
     * @param {Number} index
     * @return {Model}
     */
    get: function (index) {
        return this._elements[index];
    },

    /**
     * @param {Number} index
     * @param model
     * @return {ModelCollection}
     */
    set: function (index, model) {
        if (is(model).notInstanceOf(Model)) {
            throw new TypeError(
                "(alamid) Unable to set given model. Model is not instance of set ModelClass."
            );
        }

        this._elements[index] = model;

        this._emitChange();

        return this.Instance;
    },

    /**
     * @return {array.<Model>}
     */
    toArray: function () {
        return this._elements;
    },

    /**
     * @return {Model}
     */
    pop: function () {

        var model = this._elements.pop();

        model.removeListener("change", this._emitChange);

        this._emitChange();

        return model;
    },

    /**
     * @return {Model}
     */
    shift: function () {

        var model = this._elements.shift();

        model.removeListener("change", this._emitChange);

        this._emitChange();

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
            if (is(model).notInstanceOf(self._Class)) {
                throw new TypeError(
                    "(alamid) Can not push model (at index: " + index + "). Wrong type of model."
                );
            }

            model.on("change", self._emitChange);

            self._elements.push(model);
        });

        this._emitChange();

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
            if (is(model).notInstanceOf(self._Class)) {
                throw new TypeError(
                    "(alamid) Can not unshift model (at index: " + index + "). Wrong type of model."
                );
            }

            model.on("change", self._emitChange);

            self._elements.unshift(model);
        });

        this._emitChange();

        return this.Instance;
    },

    /**
     * @return {ModelCollection}
     */
    reverse: function() {
        this._elements.reverse();

        return this.Instance;
    },

    /**
     * @return {Number}
     */
    size: function () {
        return this._elements.length;
    },

    /**
     * @param {function} iterator
     */
    each: function (iterator) {
        _(this._elements).each(iterator);
    },

    /**
     * @param {function.<model, index>} filterIterator
     * @return {array}
     */
    filter: function (filterIterator) {
        return _(this._elements).filter(filterIterator);
    },

    /**
     * Prepares ModelCollection for the Garbage collection
     */
    dispose: function () {
        var self = this;

        _(this._elements).each(function eachIterator(model, index) {
            model.removeListener("change", self._emitChange);
        });

        this._Class = null;
        this._elements = null;
    },

    /**
     * @private
     */
    _emitChange: function () {
        if (this._isMuted === false) {
            this.Super.emit("change");
        }
    }

});

module.exports = ModelCollection;