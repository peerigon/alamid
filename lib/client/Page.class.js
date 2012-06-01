var Class = require("nodeclass").Class,
    getPage = require('./getPage'),
    domAdapter = require('./domAdapter');

module.exports = new Class({
    Extends: require('./DisplayObject.class'),
    "init": function() {

    },
    "__name": '',
    "_setName": function setName(name) {
        this.__name = name.replace(/(.*\/)|(\.class\.js$)/g, '');
    },
    "getName": function getName() {
        return this.__name;
    },
    "_nodeMap": null,
    "create": function create(node) {
        this._nodeMap = this.Super.getNodeMap();
        this.Super.create(node);
        node.pageObject = this.Instance;
    },
    "$create": function $create(node, url, callback) {
        var page,
            data;

        function onPageLoaded(err, PageClass) {
            if (err) throw err;
            page = new PageClass();
            page.create(node);
            callback();
            if (data) {
                page.emit("dataloaded", data[0], data[1]);
                domAdapter.removeClass(node, 'loading');
                page.display();
            }
        }

        function onDataLoaded(err, response) {
            if (page) {
                page.emit("dataloaded", err, response);
                domAdapter.removeClass(node, 'loading');
                page.display();
            } else {
                data = [err, response];
            }
        }

        domAdapter.addClass(node, 'loading');
        getPage(url, onPageLoaded, onDataLoaded);
    },
    "__states": null,
    "__possibleStates": null,   // cached keys array of __states
    "_registerState": function _registerState(stateName, stateHandler) {
        var isIndexState = this.__states === null;

        if (!this._nodeMap.page) {
            throw new Error('Cannot register state: This page has no subpage');
        }

        if (isIndexState) {
            this.__states = {};
            this.__possibleStates = [];
        }
        if (!this.__states[stateName]) {
            this.__possibleStates.push(stateName);
        }
        this.__states[stateName] = stateHandler;
    },
    "__currentState": null,
    "setState": function setState(stateName, callback) {
        var node = this._nodeMap.page,
            self = this,
            stateHandler;

        function onPageCreate() {
            self.Super.emit('statechange', stateName);
            callback();
        }

        function doSet(url) {
            var subPage;

            if (url === false) {
                return;     // abort setState operation
            }
            subPage = self.getSubPage();
            if (subPage) {
                subPage.destroy();
                subPage.dispose();
            }
            if (url) {
                if (url.search(/\?/) === -1) {
                    url = url + window.location.search;
                }
                self.__currentState = stateName;
                Class.$create(node, url, onPageCreate);
            } else if(url === '') {
                self.__currentState = stateName;
                self.Super.emit('statechange');
                callback();
            } else {
                throw new Error('Cannot change state: Unknown state "' + stateName + '"');
            }
        }

        if (!this.__states) {
            throw new Error('Cannot change state: This page has no states registered');
        }
        if (!node) {
            throw new Error('Cannot change state: This page has no subpage');
        }
        if (stateName === 'index' || !stateName) {
            stateName = this.__possibleStates[0];
        }
        callback = callback || function() {};
        stateHandler = this.__states[stateName];
        if (typeof stateHandler === 'function') {
            stateHandler(doSet);
        } else {
            doSet(stateHandler);
        }
    },
    "getState": function getState() {
        return this.__currentState;
    },
    "getPossibleStates": function getPossibleStates() {
        return this.__possibleStates;
    },
    "getSubPage": function getSubPage() {
        if (this._nodeMap.page) {
            return this._nodeMap.page.pageObject;
        } else {
            return null;
        }
    },
    "destroy": function destroy() {
        var node = this.Super.getNode(),
            subPage = this.getSubPage();

        if (node.pageObject === this.Instance) {
            node.pageObject = null;
        }
        if (subPage) {
            subPage.destroy();
        }
        this.Super.destroy();
    }
});