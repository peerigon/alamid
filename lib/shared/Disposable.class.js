"use strict";

var Class = require("alamid-class");

var Disposable = new Class("Disposable", {
    _runOnDispose: null,
    constructor: function () {
        this._runOnDispose = [];
    },
    addDisposable: function (disposable) {
        this._runOnDispose.push(disposable.dispose.bind(disposable));

        return disposable;
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

        this.disposable._runOnDispose.push(function removeEventListener() {
            observable.removeListener(event, listener);
        });

        return observable.on(event, listener);
    }
};

module.exports = Disposable;