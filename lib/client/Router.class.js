"use strict";

var _ = require("underscore"),
    Class = require("nodeclass").Class,
    is = require("nodeclass").is,
    EventEmitter = require("../shared/EventEmitter.class.js"),
    Page = require("./Page.class.js"),
    pageJS = require("page"),
    historyJS = require("history.js");

var Router = new Class({

    Extends: EventEmitter,

    /**
     * @type {Page}
     * @private
     */
    __lastPage: null,

    /**
     * @type {Page}
     * @private
     */
    __currentPage: null,

    /**
     * @type {Page}
     * @private
     */
    __mainPage: null,

    /**
     * @param {Page} mainPage
     * @constructor
     */
    init: function (mainPage) {

        if (is(mainPage).notInstanceOf(Page)) {
            throw new Error("(alamid)");
        }

        this.__mainPage = mainPage;
        this.__currentPage = mainPage;

    },

    /**
     * NOTE: Not every Page must have an Service, but length of both returned arrays from
     * resolvePageLoaders() and resolvePageServices() must have the same length.
     * Params will be parsed and applied on each service-call
     *
     * @param {string} route
     * @param {function(): array} resolvePageLoaders
     * @param {function(): array} resolvePageServices
     * @return {Router}
     */
    register: function (route, resolvePageLoaders, resolvePageServices) {

        pageJS(route, this._getRouteHandler(resolvePageLoaders, resolvePageServices));

        return this.Instance;
    },

    /**
     * @param {string} route
     * @param {function(): array} resolvePageLoaders
     *
     * @return (function)
     */
    _getRouteHandler: function (route, resolvePageLoaders, resolvePageServices) {

        var self = this;

        return function routeHandler() {

            var pageLoaders,
                loadedPages = [],
                pageServices,
                pageCount,
                pageServicesParams,
                addedEvents = [];

            function markPageAsLoaded(pageIndex, page) {
                loadedPages[pageIndex] = page;

                if (loadedPages.length === pageCount) {
                    self.emit("route" + " resolved");
                }

            }

            if (resolvePageLoaders === undefined) {
                pageLoaders = self.__resolvePageLoaders(route);
            } else {
                pageLoaders = resolvePageLoaders();
            }

            pageCount = pageLoaders.lenght;

            if (resolvePageServices === undefined) {
                pageServices = self.__resolveServices(route);
            }

            pageServicesParams = self.__resolveServiceParams(route);

            _(pageLoaders).each(function loadPage(pageLoader, pageLoaderIndex) {
                pageLoader(function pageLoaded(page) {

                    var parentPageIndex,
                        parentPage,
                        uniquePageEvent;

                    parentPageIndex = pageLoaderIndex - 1;
                    //Parent-Page will be undefined if it is not loaded yet
                    parentPage = loadedPages[parentPageIndex];

                    //Create an unique event-name that will be emitted to tell Sub-Pages that their Parent-Page was loaded
                    uniquePageEvent = route + parentPageIndex;

                    //Mark Page as loaded
                    markPageAsLoaded(pageLoaderIndex, page);

                    //Emit "pageloaded"-Event for the Page-Life-Cycle/-Controller-Logic
                    page.emit("pageloaded");

                    if (pageLoaderIndex > 0) {
                        //If Parent-Page is already loaded then set loaded Page as Sub-Page of it
                        if (parentPage) {
                            parentPage.setSubPage(page);

                            //Wait until Parent-Page was loaded and then set loaded Page as Sub-Page of it
                        } else {
                            self.Super.once(uniquePageEvent, function parentPageLoaded(parentPage) {
                                parentPage.setSubPage(page);
                            });
                            //Collect event for cleaning to make sure that no event-listener is open after request was resolved
                            addedEvents.push(uniquePageEvent);
                        }
                    }

                    //Tell a Sub-Page using the unique event-name that it's Parent-Page is loaded
                    self.Super.emit(uniquePageEvent, page);
                });
            });

            _(pageServices).each(function loadPageData(pageService, pageServiceIndex) {
                //Params of a service must have the same index as the Service itself
                var pageServiceParams = pageServicesParams[pageServiceIndex];

                pageService.get(pageServiceParams, function pageDataLoaded(pageModels) {
                    //Service for a Page must have the same index as the Page itself
                    var pageIndex = pageServiceIndex,
                        page,
                        uniquePageEvent;

                    page = loadedPages[pageIndex];
                    uniquePageEvent = route + pageIndex;

                    //At this point I've no idea if a Service returns Models or just data
                    //I think that Models would be much nicer, so I assumed that.

                    //If Page was loaded in the meantime then pass requested data
                    if (page) {
                        page.emit("dataloaded", pageModels);
                    //If Page isn't loaded yet, then wait until it is loaded an pass then requested data
                    } else {
                        self.Super.once(uniquePageEvent, function onPageDataLoaded(page) {
                            page.emit("dataloaded", pageModels);
                        });
                        //Collect event for cleaning to make sure that no event-listener is open after request was resolved
                        addedEvents.push(uniquePageEvent);
                    }

                });

            });

            //If all Pages have been loaded than set them as Sub-Page of Current-Page
            self.Super.once(route + " resolved", function onRouteResolved() {
                //Page with highest hierarchy will be transited in/out
                var transitionPage = loadedPages[0];

                //Cleaning: Make sure that all added listeners stop listening
                _(addedEvents).each(function removeEvent(addedEvent) {
                    self.Super.removeAllListeners(addedEvent);
                });

                self.__lastPage = self.__currentPage;
                self.__currentPage.setSubPage(transitionPage);

                //@TODO Make transition here

                self.__currentPage = transitionPage;

                //@TODO Add to history
            });
        };
    },


    /**
     * @param {string} route
     * @return {array}
     * @private
     */
    __resolvePageLoaders: function (route) {
        var pageLoaders = [];

        //@TODO

        return pageLoaders;
    },

    /**
     * @param {string} route
     * @return {array}
     * @private
     */
    __resolveServices: function (route) {
        var pageServices = [];

        //@TODO

        return pageServices;
    },

    /**
     * @param route
     * @return {*}
     * @private
     */
    __resolveServiceParams: function (route) {
        var pageServicesParams;

        //@TODO

        return pageServicesParams;
    }

});