"use strict";

var Class = require("nodeclass").Class,
    is = require("nodeclass").is,
    _ = require("underscore"),
    DisplayObject = require("./DisplayObject.class.js"),
    ModelCollection = require("../shared/ModelCollection.class.js"),
    View = require("./View.class.js"),
    ALAMID = require("./CONSTANTS.js"),
    domAdapter = require("./domAdapter.js");

var ViewCollection = new Class({

    Extends: DisplayObject,

    /**
     * @type Array
     * @protected
     */
    _views: [],

    /**
     * @type ModelCollection
     * @protected
     */
    _models: null,

    /**
     * @type Class
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
    //@TODO What happens if ModelCollection will be sorted?
    bind: function (modelCollection) {

        var newView,
            self = this;

        if (is(modelCollection).notInstanceOf(ModelCollection)) {
            throw new TypeError(
                "(alamid) Unable to bind. Given argument is not instance of ModelCollection"
            );
        }

        if (this._models) {
            this.disposeElements();
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
     * Renders all Views of ViewCollection. If ViewCollection was already rendered than all Views will be re-rendered.
     *
     * @return {ViewCollection}
     */
    //@TODO Tests
    render: function () {

        this._views = this.destroyViews();

        this._addViews(this._views);

        return this.Instance;
    },

    /**
     * Destroys all Views and returns them as array.
     * Views are still part of the ViewCollection after they have been destroyed().
     * @return {array}
     */
    //@TODO Tests
    destroyViews: function () {
        var destroyedViews = [];

        _(this._views).each(function destroyView(view) {
            destroyedViews.push(view.destroy());
        });

        return destroyedViews;
    },

    /**
     * Disposes all elements of ViewCollection, but not ViewCollection itself.
     *
     * @return {ViewCollection}
     */
    //@TODO Tests
    disposeElements: function () {

        _(this._views).each(function disposeView(view) {
            view.dispose();
        });
        this._views = [];

        return this.Instance;
    },

    /**
     * Removes all collection elements from DOM and prepares them for garbage-collection
     */
    //@TODO Tests
    dispose: function () {

        this.Super.dispose();
        this._ViewClass = null;
        this._views = null;
        this._models = null;

    },

    /**
     * NOTE: This is an event-listener and should be called directly.
     *
     * @param {number} index
     * @param {array} models
     * @param {boolean} isMutated
     * @protected
     */
    _onAdd: function (index, models, isMutated) {
        var newView,
            newViews = [],
            spliceArguments,
            prepend,
            self = this;


        if (isMutated === true) {

            //If passded index is 0 it is basically possible that ModelCollection's .push() or .unshift() was called.
            //But it doesn't matter if new Views will be pushed or unshifted to ViewCollection, because if .push()
            //was called on ModelCollection and the passed index is 0 the ModelCollection must have been empty before.
            //In this case .push() and .unshift() mutates an empty Array in the same way.
            prepend = (index === 0);

            _(models).each(function createNewView(model) {
                newView = self._viewFactory();
                newView.bind(model);

                newViews.push(newView);
            });

            spliceArguments = [index, 0].concat(newViews);
            Array.prototype.splice.apply(this._views, spliceArguments);

            this._addViews(newViews, prepend);

        //A new Model was set on an existing index.
        } else {
            this._views[index].bind(models[0]);
        }
    },

    /**
     * NOTE: This is an event-listener and should be called directly.
     *
     * @param {number} index
     * @param {array} models
     * @protected
     */
    _onRemove: function (index, models) {

        var removedViews;

        removedViews = this._views.splice(index, models.length);

        //Prepare removed Views for Garbage-Collection
        _(removedViews).each(function unbindModel(view) {
            view.dispose();
        });

    },

    /**
     * @param {array} views
     * @param {boolean} prepend (optional)
     * @protected
     */
     //@TODO Throw events before a View will be added to ViewCollection
    _addViews: function (views, prepend) {

        var self = this;

        //._prepend() prepends according to first child of ViewCollection.
        //So views must be reversed to achieve right order before iterating over them.
        if (prepend === true) {
            views.reverse();
        }

        _(views).each(function _addView(view) {

            if (prepend === true) {
                self.Super._prepend(view).at("views");
            } else {

                self.Super._append(view).at("views");
            }

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