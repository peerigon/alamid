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
     */
    register: function (route, resolvePageLoaders, resolvePageServices) {

        var pageLoaders,
            loadedPages = [],
            pageServices,
            pageCount,
            pageServicesParams,
            self = this;

        if (resolvePageLoaders === undefined) {
            pageLoaders = this.__resolvePageLoaders(route);
        } else {
            pageLoaders = resolvePageLoaders();
        }

        pageCount = pageLoaders.lenght;

        if (resolvePageServices === undefined) {
            pageServices = this.__resolveServices(route);
        }

        pageServicesParams = this.__resolveServiceParams(route);

        _(pageLoaders).each(function loadPage(pageLoader, pageLoaderIndex) {
            pageLoader(function pageLoaded(page) {

                var parentPageIndex,
                    parentPage,
                    uniquePageEvent;

                //Create an unique event-name that will be emitted to tell Sub-Pages that their Parent-Page was loaded
                uniquePageEvent = route + pageLoaderIndex;

                parentPageIndex = pageLoaderIndex - 1;
                //Parent-Page will be undefined if it is not loaded yet
                parentPage = loadedPages[parentPageIndex];

                //Mark Page as loaded
                loadedPages.push(page);

                //Emit "pageloaded"-Event for the Page-Life-Cycle/-Controller-Logic
                page.emit("pageloaded");

                //If Page is the highest in hierarchy then set it as Sub-Page of Current-Page
                if (pageLoaderIndex === 0) {
                    self.__currentPage.setSubPage(page);
                }

                //If Page is desired Page/lowest in hierarchy then set it as the Current-Page
                if(pageLoaderIndex === pageCount) {
                    self.__lastPage = self.__currentPage;
                    self.__currentPage = page;
                }

                if (pageLoaderIndex > 0) {
                    //If Parent-Page is already loaded then set loaded Page as Sub-Page of it
                    if (parentPage) {
                        parentPage.setSubPage(page);

                        //Wait until Parent-Page was loaded and then set loaded Page as Sub-Page of it
                    } else {
                        self.once(uniquePageEvent, function parentPageLoaded(parentPage) {
                            parentPage.setSubPage(page);
                        });
                    }
                }

                //Tell a Sub-Page using the unique event-name that it's Parent-Page is loaded
                self.emit(uniquePageEvent, page);
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
                    self.once(uniquePageEvent, function onPageDataLoaded(page) {
                        page.emit("dataloaded", pageModels);
                    });
                }

            });

        });

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