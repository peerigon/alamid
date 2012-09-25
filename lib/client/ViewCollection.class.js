"use strict";

var Class = require("nodeclass").Class,
    NodeClass = Class,
    is = require("nodeclass").is,
    _ = require("underscore"),
    DisplayObject = require("./DisplayObject.class.js"),
    ModelCollection = require("../shared/ModelCollection.class.js"),
    View = require("./View.class.js"),
    ALAMID = require("./CONSTANTS.js"),
    domAdapter = require("./helpers/domAdapter.js");

var ViewCollection = new Class("ViewCollection", {

    Extends: DisplayObject,

    /**
     * @type {array}
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
     * @type {function}
     * @protected
     */
    _filter: null,

    /**
     * Returns a Class instance of ViewCollection
     *
     * @param {!String} className
     * @param {!Object} descriptor
     * @return {Function}
     * @static
     */
    $define: function (className, descriptor) {

        descriptor.Extends = ViewCollection;

        return new NodeClass(className, descriptor);
    },

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

        modelCollection.on("add", this._onAdd);
        modelCollection.on("remove", this._onRemove);
        modelCollection.on("sort", this._onSort);

        this.render();

        return this.Instance;
    },

    /**
     * If filter is 'null' no filter will be used, else given filter be used for rendering Views.
     * If a ModelCollection was bound .render() will be executed automatically.
     *
     * @param {null|function(Model,number): boolean} filter
     * @return {ViewCollection}
     */
    setFilter: function (filter) {

        if (filter !== null && typeof filter !== "function") {
            throw new TypeError(
                "(alamid) Cannot apply filter. Filter must be null or a function, but " +
                typeof filter + " was given."
            );
        }

        this._filter = filter;

        //Automatically re-render Views if a filter was set and a ModelCollection was bound.
        if (this._models !== null && (filter === null || typeof filter === "function")) {
            return this.render(); //returns this.Instance
        }

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

        this._createNewViews();

        //_addViews is the real 'rendering' method of the ViewCollection.
        this._addViews(this._views, null);

        return this.Instance;
    },

    /**
     * @param {function(View, number)} viewIterator
     */
    each: function (viewIterator) {
        _(this._views).each(viewIterator);
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
            self = this;

        if (isMutated === true) {
            //Create new Views for new Models.
            _(models).each(function createNewView(model) {
                newView = self._viewFactory();
                newView.bind(model);

                newViews.push(newView);
            });

            spliceArguments = [index, 0].concat(newViews);
            Array.prototype.splice.apply(this._views, spliceArguments);

            this._addViews(newViews, index);

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

        this.Super.emit("beforeSort");

        //Will create new Views according to the new sorting of bound ModelCollection
        this._createNewViews();
        this.render();

        this.Super.emit("sort");
    },

    /**
     * _addViews is the real renderer of the ViewCollection. But it does not parse nodes of the Views on
     * 'data-node'-attributes equal to Model-attributes. This is already done by each View itself.
     * Instead it appends or prepends the View in a as much as possible efficient way to it's own node.
     *
     * If null was passed as index, this means that all Views of ViewCollection will be re-rendered.
     *
     * @param {array} views
     * @param {null|number} index
     * @protected
     */
    _addViews: function (views, index) {

        //If passed index is 0 it is basically possible that ModelCollection's .push() or .unshift() was called.
        //But it doesn't matter if new Views will be pushed or unshifted to ViewCollection, because if .push()
        //was called on ModelCollection and the passed index is 0 the ModelCollection must have been empty before.
        //In this case .push() and .unshift() mutates an empty Array in the same way.
        var modelIndex,
            prepend = (index === 0),
            self = this;

        //._prepend() prepends according to current first child of ViewCollection.
        //So Views must be reversed to achieve right order before iterating over them.
        if (prepend === true) {
            views.reverse();
        }

        //From now on index will be used as index of Models in ModelCollection.
        //Views must have the same order and so the same index as their Models in ModelCollection.
        modelIndex = index;
        if (modelIndex === null) {
            modelIndex = 0;
        }
        //If prepend is true Views are reversed, so modelIndex must be count down.
        if(prepend === true) {
            modelIndex = views.length - 1;
        }

        this.Super.emit("beforeAdd", views);

        _(views).each(function _addView(view) {
            //Display only Views where filter returns true.
            if (self._execFilter(self._models.get(modelIndex), modelIndex) === true) {

                if (prepend === true) {
                    self.Super._prepend(view).at("views");
                    modelIndex--;
                } else {
                    self.Super._append(view).at("views");
                    modelIndex++;
                }

            }

        });

        this.Super.emit("add", views);

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

        this._disposeViews();

        this._models.each(function createNewView(model) {
            newView = self._viewFactory();
            newView.bind(model);
            self._views.push(newView);
        });
    },

    /**
     * Disposes all Views in ViewCollection, but not ViewCollection itself.
     */
    _disposeViews: function () {

        _(this._views).each(function disposeView(view) {
            view.dispose();
        });
        this._views = [];
    },

    /**
     * Returns true if no filter was set.
     *
     * @param {Model} model
     * @param {number} index
     * @return {boolean}
     * @protected
     */
    _execFilter: function (model, index) {

        if (this._filter === null) {
            return true;
        }

        return this._filter(model, index);
    }

});

module.exports = ViewCollection;