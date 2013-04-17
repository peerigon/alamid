"use strict";

var Class = require("alamid-class");

var Disposable = new Class("Disposable", {
    _runOnDispose: null,
    constructor: function () {
        this._runOnDispose = [];
    },
    addDisposable: function (disposable) {
        this.runOnDispose(disposable.dispose.bind(disposable));

        return this;
    },
    runOnDispose: function (fn) {
        this._runOnDispose.push(fn);

        return this;
    },
    dispose: function () {
        var i;

        for (i = 0; i < this._runOnDispose.length; i++) {
            this._runOnDispose[i].call(this);
        }
    }
});

module.exports = Disposable;