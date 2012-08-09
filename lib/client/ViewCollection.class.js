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

        if (is(modelCollection).notInstanceOf(ModelCollection)) {
            throw new TypeError(
                "(alamid) Unable to bind. Given argument is not instance of ModelCollection"
            );
        }

        if (this._models) {
            this._models.removeListener("add", this._onAdd);
            this._models.removeListener("remove", this._onRemove);
            this._models.removeListener("sort", this._onSort);
        }

        this._models = modelCollection;

        this._createNewViews();

        modelCollection.on("add", this._onAdd);
        modelCollection.on("remove", this._onRemove);
        modelCollection.on("sort", this._onSort);

        this.render();

        return this.Instance;
    },

    /**
     * Renders all Views of ViewCollection. If ViewCollection was already rendered than all Views will be re-rendered.
     *
     * @return {ViewCollection}
     */
    render: function () {

        //Check if there is any data to render
        if (this._models === null) {
            throw new Error(
                "(alamid) Unable to render Views in ViewCollection. " +
                    "Neither data to render was given nor a ModelCollection was bound."
            );
        }

        this._views = this.destroyViews();

        this._addViews(this._views);

        return this.Instance;
    },

    /**
     * @param {function(View, number)} viewIterator
     */
    each: function (viewIterator) {
        _(this._views).each(viewIterator);
    },

    /**
     * Destroys all Views and returns them as array.
     * Views are still part of the ViewCollection after they have been destroyed().
     * @return {array}
     */
    destroyViews: function () {
        var destroyedViews = [];

        _(this._views).each(function destroyView(view) {
            destroyedViews.push(view.destroy());
        });

        this.Super.emit("destroyViews");

        return destroyedViews;
    },

    /**
     * Disposes all elements of ViewCollection, but not ViewCollection itself.
     *
     * @return {ViewCollection}
     */
    disposeViews: function () {

        _(this._views).each(function disposeView(view) {
            view.dispose();
        });
        this._views = [];

        this.Super.emit("disposeViews");

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
     * NOTE: This is an event-listener and should NOT be called directly.
     *
     * @param {array} models
     * @param {number} index
     * @param {boolean} isMutated
     * @protected
     */
    _onAdd: function (models, index, isMutated) {
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
     * NOTE: This is an event-listener and should NOT be called directly.
     *
     * @param {array} models
     * @param {number} index
     * @protected
     */
    _onRemove: function (models, index) {

        var removedViews,
            self = this;

        removedViews = this._views.splice(index, models.length);

        self.Super.emit("beforeRemove", removedViews);
        //Prepare removed Views for Garbage-Collection
        _(removedViews).each(function unbindModel(view) {
            view.dispose();
        });
        self.Super.emit("remove");

    },

    /**
     * NOTE: This is an event-listener and should NOT be called directly.
     *
     * @protected
     */
    _onSort: function () {

        this.Super.emit("beforeSort", this._views);

        //Will create new Views according to the new sorting of bound ModelCollection
        this._createNewViews();
        this.render();

        this.Super.emit("sort", this._views);
    },

    /**
     * @param {array} views
     * @param {boolean} prepend (optional)
     * @protected
     */
    _addViews: function (views, prepend) {

        var self = this;

        //._prepend() prepends according to first child of ViewCollection.
        //So views must be reversed to achieve right order before iterating over them.
        if (prepend === true) {
            views.reverse();
        }

        self.Super.emit("beforeAdd", views);

        _(views).each(function _addView(view) {

            if (prepend === true) {
                self.Super._prepend(view).at("views");
            } else {

                self.Super._append(view).at("views");
            }

        });

        self.Super.emit("add", views);

    },

    /**
     * @return {this._ViewClass}
     * @protected
     */
    _viewFactory: function () {
        return new this._ViewClass();
    },

    /**
     * (Re-)Creates Views.
     *
     * @protected
     */
    _createNewViews: function () {
        var newView,
            self = this;

        this.disposeViews();

        this._models.each(function createNewView(model) {
            newView = self._viewFactory();
            newView.bind(model);
            self._views.push(newView);
        });
    }

});

module.exports = ViewCollection;