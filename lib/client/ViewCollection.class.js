"use strict";

var Class = require("nodeclass").Class,
    is = require("nodeclass").is,
    _ = require("underscore"),
    DisplayObject = require("./DisplayObject.class.js"),
    ModelCollection = require("../shared/ModelCollection.class.js"),
    View = require("./View.class.js"),
    ALAMID = require("./ALAMID_CLIENT_CONST.js"),
    domAdapter = require("./domAdapter.js");

var ViewCollection = new Class({

    Extends: DisplayObject,

    /**
     * @type {Array}
     * @protected
     */
    _views: [],

    /**
     * @type {ModelCollection}
     * @protected
     */
    _models: null,

    /**
     * @type {Class}
     * @protected
     */
    _ViewClass: null,

    /**
     *
     * @param {Class} ViewClass
     * @param {Class} collectionTemplate (optional)
     */
    init: function (ViewClass, collectionTemplate) {

        var hasOneDataNode;

        this._ViewClass = ViewClass;

        this.Super(collectionTemplate);

        hasOneDataNode = domAdapter(this.Super.getNode())
            .find("[data-node='" + ALAMID.VIEW_COLLECTION_DATA_NODE_VALUE  + "']")
            .length === 1;

        if (hasOneDataNode === false) {
            throw new Error(
                "(alamid) Cannot construct ViewCollection: " +
                "Given template has no or more than one node with [data-node='" + ALAMID.VIEW_COLLECTION_DATA_NODE_VALUE +
                "']-Attribute defined. Template: " + collectionTemplate
            );
        }
    },

    /**
     * @param {function} viewFactory
     * @return {ViewCollection}
     */
    setViewFactory: function (viewFactory) {

        this._viewFactory = viewFactory;

        return this.Instance;

    },

    /**
     * @param {ModelCollection} modelCollection
     * @return {ViewCollection}
     */
    bind: function (modelCollection) {

        var newView,
            self = this;

        if (is(modelCollection).notInstanceOf(ModelCollection)) {
            throw new TypeError(
                "(alamid) Unable to bind. Given argument is not instance of ModelCollection"
            );
        }

        if (this._models) {
            this.empty();
            this._models.removeListener("add", this._onAdd);
            this._models.removeListener("remove", this._onRemove);
        }

        this._models = modelCollection;

        modelCollection.each(function createNewView(model) {
            newView = self._viewFactory();
            newView.bind(model);
            self._views.push(newView);
        });

        modelCollection.on("add", this._onAdd);
        modelCollection.on("remove", this._onRemove);

        this.render();

        return this.Instance;
    },

    /**
     * Disposes all elements to empty collection
     *
     * @return {ViewCollection}
     */
    empty: function () {

        _(this._views).each(function disposeView(view) {
            view.dispose();
        });
        this._views = [];

        return this.Instance;
    },

    /**
     * @return {ViewCollection}
     */
    render: function () {

        var self = this;

        _(this._views).each(function appendViewToCollection(view) {
            self.Super._append(view).at("views");
        });

        return this.Instance;
    },

    /**
     * Removes all collection elements from DOM and prepares them for garbage-collection
     */
    dispose: function () {

        this.Super.dispose();
        this._ViewClass = null;
        this._views = null;
        this._models = null;

    },

    /**
     * @param {number} index
     * @param {Models} models
     * @param {number} length
     * @protected
     */
    _onAdd: function (index, models, length) {
        var newView,
            newViews = [],
            self = this;

        _(models).each(function createNewView(model) {
            newView = self._viewFactory();

            newView.bind(model);
            newViews.push(newView);
        });

        this._views.splice(index, 0, newViews);
    },

    /**
     * @param {number} index
     * @param {Models} models
     * @param {number} length
     * @protected
     */
    _onRemove: function (index, models, length) {
        var removedViews;

        removedViews = this._views.splice(index, length);

        //Prepare removed Views for Garbage-Collection
        _(removedViews).each(function unbindModel(view) {
            view.dispose();
        });
    },

    /**
     * @return {this._ViewClass}
     * @protected
     */
    _viewFactory: function () {
        return new this._ViewClass();
    }

});

module.exports = ViewCollection;