"use strict";

var value = require("value"),
    _ = require("underscore"),
    DisplayObject = require("./DisplayObject.class.js"),
    ModelCollection = require("../shared/ModelCollection.class.js"),
    View = require("./View.class.js"),
    ALAMID = require("./CONSTANTS.js"),
    domAdapter = require("./helpers/domAdapter.js");

var ViewCollection = DisplayObject.extend("ViewCollection", {

    /**
     * @type {Array}
     * @protected
     */
    _views: null,

    /**
     * @type {ModelCollection}
     * @protected
     */
    _models: null,

    /**
     * @type {Function}
     * @protected
     */
    _ViewClass: null,

    /**
     * @type {Function}
     * @protected
     */
    _filter: null,

    /**
     * @type {Object.<string, function>}
     * @protected
     */
    _delegateOnAdd: null,

    /**
     *
     * @param {Class} ViewClass
     * @param {Class} collectionTemplate (optional)
     */
    constructor: function (ViewClass, collectionTemplate) {

        var hasOneDataNode,
            viewCollectionNodes;

        this._views = [];
        this._delegateOnAdd = {};

        this._ViewClass = ViewClass;

        this._super(collectionTemplate);

        viewCollectionNodes = domAdapter(this.node).find("[data-node='" + ALAMID.VIEW_COLLECTION_DATA_NODE_VALUE  + "']");
        hasOneDataNode = viewCollectionNodes.length === 1;

        if (hasOneDataNode === false) {
            throw new Error(
                "(alamid) Cannot construct ViewCollection: " +
                "Given template has no or more than one node with [data-node='" + ALAMID.VIEW_COLLECTION_DATA_NODE_VALUE +
                "']-Attribute defined. Template: '" + collectionTemplate + "'"
            );
        }
    },

    /**
     * @param {function} viewFactory
     * @return {ViewCollection}
     */
    setViewFactory: function (viewFactory) {

        this._viewFactory = viewFactory;

        return this;

    },

    /**
     * @param {ModelCollection} modelCollection
     * @return {ViewCollection}
     */
    bind: function (modelCollection) {

        if (value(modelCollection).notTypeOf(ModelCollection)) {
            throw new TypeError(
                "(alamid) Unable to bind. Given argument is not instance of ModelCollection"
            );
        }

        this._removeModelsListeners();
        this._models = modelCollection;
        this._addModelsListeners();

        this.render();

        return this;
    },

    /**
     * If filter is 'null' no filter will be used, else given filter be used for rendering Views.
     * If a ModelCollection was bound .render() will be executed automatically.
     *
     * @param {null|function(Model,number): boolean} filter
     * @return {ViewCollection}
     */
    setFilter: function (filter) {

        var self = this;

        if (filter !== null && typeof filter !== "function") {
            throw new TypeError(
                "(alamid) Cannot apply filter. Filter must be null or a function, but " +
                typeof filter + " was given."
            );
        }

        this._filter = filter;

        //Automatically re-render Views if a filter was set and a ModelCollection was bound.
        if (this._models !== null && (filter === null || typeof filter === "function")) {
            _(this._views).each(self._execFilter, this);
        }

        return this;
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

        return this;
    },

    /**
     * @param {function(View, number)} viewIterator
     */
    each: function (viewIterator) {
        _(this._views).each(viewIterator);
    },

    /**
     * Delegates given event and listener to each View of Collection.
     *
     * @param {!String} event
     * @param {!function)} listener
     */
    delegate: function (event, listener) {

        function delegateEvent(view) {
            view.on(event, listener, view);
        }

        function onAdd(views) {
            _(views).each(delegateEvent);
        }

        // delegate event to all Views
        _(this._views).each(delegateEvent);

        // delegate event to all new Views
        this.on("add", onAdd);

        // collect onAdd for undelegation
        if (_.isArray(this._delegateOnAdd[event]) === false) {
            this._delegateOnAdd[event] = [];
        }
        this._delegateOnAdd[event].push(onAdd);
    },

    /**
     * Removes given event (and listener) from each View of Collection.
     *
     * @param {!String} event
     * @param {!function(View)} listener
     */
    undelegate: function (event, listener) {

        var self = this;

        // remove event from all Views
        _(this._views).each(function undelegateEvent(view) {
            view.removeListener(event, listener);
        });

        // stop delegation of event for new Views
        // check if there are collected onAdd() for event, so that it won't crash
        // and it will behave like removeAllListeners for given, but unattached event.
        if (this._delegateOnAdd.event) {
            _(this._delegateOnAdd.event).each(function removeOnAddForEvent(onAdd) {
                self.removeListener("add", onAdd);
            });
        }
    },

    /**
     * Removes all collection elements from DOM and prepares them for garbage-collection
     */
    dispose: function () {

        this._removeModelsListeners();
        this._super();
        // child views should be disposed by DisplayObjects regular dispose, as they are added by _append/_prepend
        this._views = null;
        this._ViewClass = null;
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

        var removedViews;

        removedViews = this._views.splice(index, models.length);

        this.emit("beforeRemove", removedViews);
        //Prepare removed Views for Garbage-Collection
        _(removedViews).each(function unbindModel(view) {
            view.dispose();
        });
        this.emit("remove");

    },

    /**
     * NOTE: This is an event-listener and should NOT be called directly.
     *
     * @protected
     */
    _onSort: function () {

        this.emit("beforeSort");

        //Will create new Views according to the new sorting of bound ModelCollection
        this._createNewViews();
        this.render();

        this.emit("sort");
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
        modelIndex = index || 0;

        //If prepend is true Views are reversed, so modelIndex must be count down.
        if(prepend === true) {
            modelIndex = views.length - 1;
        }

        this.emit("beforeAdd", views);

        _(views).each(function _addView(view) {
            //Display only Views where filter returns true.

            if (prepend === true) {
                self._prepend(view).at("views");
            } else {
                self._append(view).at("views");
            }

            self._execFilter(view);

            modelIndex += prepend? -1: 1;

        });

        this.emit("add", views);

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
        this._views = [];

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
        this._views = null;
    },

    /**
     * @protected
     */
    _addModelsListeners: function () {
        this._models.on("add", this._onAdd, this);
        this._models.on("remove", this._onRemove, this);
        this._models.on("sort", this._onSort, this);
    },

    /**
     * @protected
     */
    _removeModelsListeners: function () {
        if (this._models) {
            this._models.removeListener("add", this._onAdd);
            this._models.removeListener("remove", this._onRemove);
            this._models.removeListener("sort", this._onSort);
        }
    },

    /**
     * @param {View} view
     * @private
     */
    _execFilter: function (view) {
        var isMatch;

        // hide or display views according to filters result
        if (value(this._filter).typeOf(Function)) {

            isMatch = this._filter(view.getModel());
            if (isMatch === true) {
                view.display();
            }
            if (isMatch === false) {
                view.hide();
            }

        }

        // display views
        if (this._filter === null) {
            view.display();
        }
    }
});

module.exports = ViewCollection;