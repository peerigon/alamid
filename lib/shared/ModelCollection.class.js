"use strict";

var Class = require("nodeclass").Class,
    Collection = require("./Collection.class.js"),
    _ = require("underscore");

var ModelCollection = new Class({

    Extends: Collection,

    /**
     * @param {Class} ModelClass
     * @param {array|Models} models
     * @constructor
     */
    init: function (ModelClass, models) {

        if (ModelClass === undefined) {
            ModelClass = require("./Model.class.js");
        }

        this.Super(ModelClass, models);

    },

    /**
     * @param {string} modelAttribute
     * @param {boolean} descending (optional)
     * @return {ModelCollection}
     */
    sortBy: function (modelAttribute, descending) {

        if (this.Super.getElements()[0].get(modelAttribute) === undefined) {
            throw new Error(
                "(alamid) Unable to sort by " + modelAttribute +
                ". Models do not have an attribute called " + modelAttribute + "."
            );
        }

        this.Super.setElements(
            _(this.Super.getElements()).sortBy(function sortModelBy(model, index) {
                return model.get(modelAttribute);
            })
        );

        if (descending === true) {
            this.Super.getElements().reverse();
        }

        this.Super._emitChange();

        return this.Instance;
    }
});

module.exports = ModelCollection;