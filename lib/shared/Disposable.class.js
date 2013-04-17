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
    watch: function (observable) {
        Observable.disposable = this;
        Observable.observable = observable;

        return Observable;
    },
    dispose: function () {
        var i;

        for (i = 0; i < this._runOnDispose.length; i++) {
            this._runOnDispose[i].call(this);
        }

        this._runOnDispose = null;
    }
});

var Observable = {
    disposable: null,
    observable: null,
    on: function (event, listener) {
        var observable = this.observable;

        this.disposable.runOnDispose(function removeEventListener() {
            observable.removeListener(event, listener);
        });

        return observable.on(event, listener);
    }
};

module.exports = Disposable;