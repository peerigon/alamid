"use strict";

var _ = require("underscore"),
    Class = require("nodeclass").Class,
    is = require("nodeclass").is,
    EventEmitter = require("../shared/EventEmitter.class.js"),
    Page = require("./Page.class.js"),
    async = require("async"),
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
            pageLoaderIndex = -1,
            loadedPages = [],
            pageServices,
            pageServicesParams,
            pageServicesParamsIndex = -1,
            pageDataLoadedIndex = -1, //Basically the same index as pageLoaderIndex, but there must a second one for pageDataLoaded
            self = this;

        if (resolvePageLoaders === undefined) {
            pageLoaders = this.__resolvePageLoaders(route);
        } else {
            pageLoaders = resolvePageLoaders();
        }

        if (resolvePageServices === undefined) {
            pageServices = this.__resolveServices(route);
        }

        pageServicesParams = this.__resolveServiceParams(route);

        /**
         * @param {function(Page)} pageLoader
         * @param {function(error} done
         */
        function loadPage(pageLoader, pageLoaded) {
            pageLoader(pageLoaded);
        }

        function pageLoaded(page) {

            var parentPageIndex,
                parentPage,
                uniquePageEvent;

            ++pageLoaderIndex;
            uniquePageEvent = route + pageLoaderIndex - 1;

            //Parent-Page will be undefined if it is not loaded yet
            parentPageIndex = pageLoaderIndex - 1;
            parentPage = loadedPages[parentPageIndex];

            loadedPages.push(page);

            //Emit "pageloaded"-Event for the Page-Life-Cycle/-Controller-Logic
            page.emit("pageloaded");

            if (pageLoaderIndex === 0) {
                this.__currentPage.setSubPage(page);
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

            //Tell a Sub-Page that it's Parent-Page is loaded
            self.emit(uniquePageEvent, page);
        }

        function loadPageData(pageService, onPageDataLoaded) {

            var pageServiceParams = pageLoadersServicesParams[++pageServicesParamsIndex];

            pageService.get(pageServiceParams, onPageDataLoaded);
        }

        function pageDataLoaded(pageData) {

            var page,
                uniquePageEvent;

            ++pageDataLoadedIndex;

            page = loadedPages[pageDataLoadedIndex];
            uniquePageEvent = route + pageDataLoadedIndex;

            if (pageData) {

                if (page) {
                    page.emit("dataloaded", pageData);
                } else {
                    self.once(uniquePageEvent, function onPageDataLoaded(page) {
                        page.emit("dataloaded");
                    });
                }

            }
        }

        async.forEach(pageLoaders, loadPage, pageLoaded);
        async.forEach(pageServices, loadPageData, pageDataLoaded);

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