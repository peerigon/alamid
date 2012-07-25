"use strict";

var Class = require("nodeclass").Class,
    Model = require("./Model.class.js"),
    is = require("nodeclass"),is,
    EventEmitter = require("./EventEmitter.class.js"),
    _ = require("underscore");

var ModelCollection = new Class({

    Extends: EventEmitter,

    __isMuted: false,

    $modelType: Model,

    __models: [],

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

        this.__emitChange(model);

        return model;
    },

    /**
     * @param {array|Model} models
     * @return {ModelCollection}
     */
    push: function (models) {

        var self = this;

        if (_(models).isArray() === false) {
            models = [models];
        }

        _(models).each(function pushModel(model, index) {
            if (!_(model).isArray() && is(model).notInstanceOf(this.$modelType)) {
                throw new Error(
                    "(alamid) Can not push Model (at index: " + index + "). Wrong type of Model."
                );
            }

            model.on("change", function onChange() {
                self.__emitChange(model);
            });

            this.__models.push(model);
        });

        this.__emitChange();

        return this.Instance;
    },

    /**
     * @return {Number}
     */
    count: function () {
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
     * @return {*}
     */
    sortBy: function (modelAttribute, descending) {

        this.__models = _(this.__models).sortBy(function sortModelBy(model, index) {
            return model.get(modelAttribute);
        });

        return this.Instance;
    },

    /**
     * @param {string} modelAttribute
     * @param {function.<model, index>} filterIterator
     * @return {array}
     */
    filter: function (modelAttribute, filterIterator) {
        return _(this.__models).filter(filterIterator);
    },

    /**
     * @param {mixed} param
     * @private
     */
    __emitChange: function (param) {
        if (this.__isMuted === false) {
            this.Super.emit("change", param);
        }
    }

});

module.exports = ModelCollection;