"use strict";

var historyAdapterMock = {

    isPushStateCalled: false,

    isReplaceStateCalled: false,

    pushState: function () {
        this.isPushStateCalled = true;
    },

    replaceState: function () {
        this.isReplaceStateCalled = true;
    }

};

module.exports = historyAdapterMock;