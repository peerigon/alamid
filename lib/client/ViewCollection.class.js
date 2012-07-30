"use strict";

var Class = require("nodeclass").Class,
    is = require("nodeclass").is,
    _ = require("underscore"),
    DisplayObject = require("./DisplayObject.class.js"),
    ModelCollection = require("../shared/ModelCollection.class.js"),
    View = require("./View.class.js"),
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

        this._ViewClass = ViewClass;

        this.Super(collectionTemplate);

        if(domAdapter(this.Super.getNode()).find("[data-node='views']").length !== 1) {
            throw new Error(
                "(alamid) Cannot construct ViewCollection: " +
                "Given template has no or more than one node with [data-node='views']-Attribute defined." +
                "Template: " + collectionTemplate
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

        var self = this;

        if (is(modelCollection).notInstanceOf(ModelCollection)) {
            throw new TypeError(
                "(alamid) Unable to bind. Given argument is not instance of ModelCollection"
            );
        }
        this._models = modelCollection;

        this._createModelViews();

        modelCollection.on("change", this._createModelViews);


        return this.Instance;
    },

    /**
     * @return {ViewCollection}
     */
    unbind: function () {

        if (this._models) {
            _(this._views).each(function unbindView(view, index) {
                view.unbind();
            });
        }

        return this.Instance;
    },

    /**
     * @return {ViewCollection}
     */
    render: function () {

        var self = this;

        _(this.views).each(function renderView(view) {
            self.Super()._append(view).at("view");
        });

        return this.Instance;
    },

    /**
     * Removes all collection elements from dom and prepares them for garbage-collection
     */
    dispose: function () {

        this.Super.dispose();
        this._ViewClass = null;
        this._views = null;
        this._models = null;

    },

    _viewFactory: function () {
        return new this._ViewClass();
    },

    _createModelViews: function () {
        var self = this;

        this._disposeViews();

        this._models.each(function createModelView(model) {
            self._views.push(self._viewFactory().bind(model));
        });

        this.render();
    },

    /**
     * @return {array}
     * @private
     */
    _disposeViews: function () {
        _(this._views).each(function disposeView(view, index) {
            view.dispose();
        });
        this._views = [];
    }

});

module.exports = ViewCollection;