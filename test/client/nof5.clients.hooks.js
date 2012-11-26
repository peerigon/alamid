"use strict";

var useClientHookExecuted = false;

exports.use = function useClientHook() {

    useClientHookExecuted = true;

    var clients = [

// Android

        {
            "family": "Android",
            "os": "Android",
            "major": 4
        },

        // iOS

        {
            "family": "iPhone",
            "os": "iOS",
            "major": 6
        },

        // Google Chrome

        {
            "family": "Chrome",
            "os": "Windows 7",
            "major": 23
        }, {
            "family": "Chrome",
            "os": "Mac OS X",
            "major": 23
        },

        // Mozilla Firefox

        {
            "family": "Windows",
            "os": "Windows 7",
            "major": 17
        }, {
            "family": "Firefox",
            "os": "Mac OS X",
            "major": 17
        },

        // Internet Explorer

        {
            "family": "IE",
            "os": "Windows 7",
            "major": 9
        },


        // Safari

        {
            "family": "Safari",
            "major": 6,
            "os": "Mac OS X"
        }

    ];

    return clients;
};